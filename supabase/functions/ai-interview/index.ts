import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, messages } = await req.json();
    
    if (!leadId || !messages || !Array.isArray(messages)) {
      throw new Error('leadId and messages array are required');
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead data to check for existing files, skip flag, and renovation scope
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('planimetria_url, foto_urls, skip_files, renovation_scope, target_rooms')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead data:', leadError);
      throw new Error('Failed to fetch lead data');
    }

    const hasSkippedFiles = leadData?.skip_files === true;
    const hasPlanimetria = leadData?.planimetria_url != null;
    const hasFoto = leadData?.foto_urls != null && leadData.foto_urls.length >= 4;
    const renovationScope = leadData?.renovation_scope || 'unknown';
    const targetRooms = leadData?.target_rooms || [];

    console.log('Lead context data:', { 
      planimetria_url: leadData?.planimetria_url, 
      foto_urls: leadData?.foto_urls,
      skip_files: hasSkippedFiles,
      renovation_scope: renovationScope,
      target_rooms: targetRooms
    });

    // Get system interview prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('kind', 'system_interview')
      .eq('is_active', true)
      .single();

    // Build comprehensive context for the AI
    let fileContext = '';
    if (hasSkippedFiles) {
      fileContext = `
📁 IMPORTANTE: L'utente ha scelto di procedere SENZA caricare foto o planimetria.
- NON chiedere mai di caricare file durante l'intervista
- Procedi direttamente con le domande dettagliate
`;
    } else if (hasPlanimetria || hasFoto) {
      fileContext = `
📁 OTTIMO: L'utente ha caricato ${hasPlanimetria ? 'la planimetria' : ''}${hasPlanimetria && hasFoto ? ' e ' : ''}${hasFoto ? `${leadData.foto_urls.length} foto` : ''}.
- Tieni in considerazione questi documenti durante l'intervista
- NON chiedere di caricare altri file
`;
    } else {
      fileContext = `
📁 NOTA: L'utente non ha ancora caricato planimetria o foto.
- Se ha i documenti, suggerisci gentilmente di caricarli
- Se non li ha, procedi comunque con domande dettagliate
- NON bloccare l'intervista per i file mancanti
`;
    }

    // Build scope context
    let scopeContext = '';
    if (renovationScope === 'partial' && targetRooms.length > 0) {
      scopeContext = `
🎯 SCOPE RILEVATO: Ristrutturazione PARZIALE
- Ambienti target: ${targetRooms.join(', ')}
- CONCENTRATI SOLO su questi ambienti nelle tue domande
- NON chiedere informazioni su altri ambienti dell'immobile
`;
    } else if (renovationScope === 'full') {
      scopeContext = `
🎯 SCOPE RILEVATO: Ristrutturazione COMPLETA
- Raccogli informazioni su TUTTI gli ambienti
- Chiedi dettagli per ogni stanza sistematicamente
`;
    } else {
      scopeContext = `
🎯 SCOPE: Da determinare
- CHIEDI come seconda domanda: "Vuoi ristrutturare l'intera casa o solo alcuni ambienti specifici?"
- In base alla risposta, adatta tutte le domande successive
`;
    }

    // FASE 1: Prompt DRASTICAMENTE SEMPLIFICATO per DeepSeek
    let systemPrompt = `Tu sei un intervistatore AI per ristrutturazioni edilizie.

🎯 OBIETTIVO: Raccogliere informazioni per capitolato tecnico.

📋 DOMANDE ESSENZIALI:
1. Dove si trova l'immobile? (città, CAP)
2. Cosa vuoi ristrutturare? (tutta la casa o solo un ambiente?)
3. Quanti mq?
4. Che lavori servono?
5. Qualità materiali? (economico/standard/premium)
6. Budget orientativo?
7. Email per invio capitolato? (chiedi DOPO il budget)

🚫 REGOLE:
- UNA DOMANDA ALLA VOLTA (max 30 parole)
- Tono amichevole e conversazionale
- NON generare preventivi

✅ QUANDO HAI RACCOLTO TUTTE LE 7 INFORMAZIONI ESSENZIALI, SCRIVI ESATTAMENTE:
"Perfetto! Ho tutte le informazioni necessarie. Ora genererò il capitolato tecnico. COMPLETATO"

IMPORTANTE: 
- La parola COMPLETATO deve essere presente per segnalare la fine
- Scrivi ESATTAMENTE quella frase con COMPLETATO alla fine
- PRIMA di completare, assicurati di aver raccolto anche l'EMAIL

${fileContext}

${scopeContext}`;


    // Prepare messages for DeepSeek API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log('Calling DeepSeek API with messages:', apiMessages);

    // Call DeepSeek API with balanced constraints
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        max_tokens: 500, // Increased to allow complete responses
        temperature: 0.3, // Lower temperature for more predictable responses
        stop: ['<!--'], // Only stop at completion tag
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    console.log('Raw DeepSeek response:', aiResponse);
    
    // FIX FASE 4: Handle empty or invalid AI responses
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('❌ AI returned empty response, using fallback');
      aiResponse = "Mi scusi, ho avuto un problema tecnico. Per favore, può ripetere la sua ultima risposta?";
    }
    
    // MINIMAL SAFETY CHECK: Only prevent extreme inappropriate responses
    const shouldForceComplete = 
      aiResponse.length > 1000 && 
      /preventivo\s+vincolante|€\s*\d+[\d.,]*\s*-\s*€\s*\d+[\d.,]*/.test(aiResponse);
    
    if (shouldForceComplete) {
      console.warn('⚠️  Response too detailed, forcing completion');
      aiResponse = "Perfetto! Ho tutte le informazioni. Procedo con il capitolato.";
      aiResponse += '\n<!--INTERVIEW_COMPLETE:{"status":"force_completed","reason":"safety_trigger"}-->';
    }

    console.log('Processed AI response:', aiResponse);

    // FASE 1: Check multiple completion signals
    const responseText = aiResponse.trim();
    const responseLower = responseText.toLowerCase();
    
    // Primary completion check
    const isComplete = responseText.includes('COMPLETATO') || 
                      responseText.includes('<!--INTERVIEW_COMPLETE-->') || 
                      responseText.includes('INTERVIEW_COMPLETE');
    
    console.log('🔍 Completion check:', { 
      hasCompletato: responseText.includes('COMPLETATO'),
      hasTag: responseText.includes('<!--INTERVIEW_COMPLETE-->'),
      responsePreview: responseText.substring(0, 100)
    });

    console.log('Checking interview completion:', { isComplete });

    // ALWAYS analyze conversation for scope detection (not just when complete)
    const conversationText = messages.map((m: any) => m.content).join(' ').toLowerCase();
    let detectedRenovationScope = 'unknown';
    let detectedTargetRooms: string[] = [];
    let isMicroIntervention = false;
    
    // Extract email from conversation
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = conversationText.match(emailRegex);
    const detectedEmail = emailMatches ? emailMatches[emailMatches.length - 1] : null;

    // Detect partial scope from keywords
    const partialKeywords = [
      'solo bagno', 'solo cucina', 'solo intonaco', 'solo pittura', 'solo soffitto',
      'tetto del bagno', 'soffitto del bagno', 'un bagno', 'rifare il soffitto',
      '6mq', '6 mq', 'piccola riparazione', 'intonacatura'
    ];
    
    const hasPartialKeywords = partialKeywords.some(kw => conversationText.includes(kw));
    
    if (hasPartialKeywords) {
      detectedRenovationScope = 'partial';
      console.log('🔍 Detected PARTIAL scope from conversation');
      
      // Extract room
      if (conversationText.includes('bagno')) detectedTargetRooms.push('bagno');
      if (conversationText.includes('cucina')) detectedTargetRooms.push('cucina');
      if (conversationText.includes('camera')) detectedTargetRooms.push('camera');
      
      // Detect micro-intervention (very small job)
      if (conversationText.includes('solo intonaco') || 
          conversationText.includes('solo pittura') ||
          conversationText.includes('tetto') || 
          conversationText.includes('soffitto')) {
        isMicroIntervention = true;
        console.log('🎯 Detected MICRO-INTERVENTION');
      }
    } else if (conversationText.includes('tutta la casa') || 
               conversationText.includes('casa completa') ||
               conversationText.includes('intero appartamento') ||
               conversationText.includes('tutto') ||
               conversationText.includes("tutto l'immobile") ||
               conversationText.includes("tutto l'appartamento") ||
               conversationText.includes('completamente') ||
               conversationText.includes('completa')) {
      detectedRenovationScope = 'full';
      console.log('🏠 Detected FULL renovation scope');
    }

    console.log('Final scope analysis:', { detectedRenovationScope, detectedTargetRooms, isMicroIntervention });

    // FASE 2: Multi-Level Fallback System (CASE-INSENSITIVE)
    const conversationLower = conversationText.toLowerCase();
    const lastUserMessage = (messages[messages.length - 1]?.content || '').toLowerCase();
    const messageCount = messages.length;
    
    // Fallback Level 1: AI explicitly signals completion
    const hasCompletionPhrase = conversationLower.includes('tutte le informazioni') || 
                                 conversationLower.includes('ho tutte le informazioni') ||
                                 conversationLower.includes('completato');
    
    // Fallback Level 2: User says "no" to budget question (last question)
    const userRefusedBudget = (lastUserMessage === 'no' || lastUserMessage === 'no grazie') && 
                               conversationLower.includes('budget');
    
    // Fallback Level 3: Message count threshold with detected scope (6+ exchanges)
    const messageThresholdReached = messageCount >= 12 && detectedRenovationScope !== 'unknown';
    
    console.log('🔍 Fallback analysis:', {
      hasCompletionPhrase,
      userRefusedBudget,
      messageThresholdReached,
      messageCount,
      detectedScope: detectedRenovationScope
    });
    
    // TRIGGER AUTO-COMPLETION if ANY fallback is met
    if (isComplete || 
        (detectedRenovationScope !== 'unknown' && hasCompletionPhrase) ||
        userRefusedBudget ||
        messageThresholdReached) {
      console.log('💾 Saving interview completion data...');
      
      // Build comprehensive interview_data with conversation and extracted details
      const interviewData = {
        conversation: messages,
        client_info: {
          email: detectedEmail
        },
        project_details: {
          renovation_scope: detectedRenovationScope,
          target_rooms: detectedTargetRooms,
          is_micro_intervention: isMicroIntervention,
          location: conversationText.match(/\b\d{5}\b/)?.[0] || 'Non specificato',
        },
        metadata: {
          completed_at: new Date().toISOString(),
          message_count: messages.length,
          completion_trigger: isComplete ? 'ai_signal' : 
                            hasCompletionPhrase ? 'completion_phrase' :
                            userRefusedBudget ? 'budget_refused' : 'message_threshold'
        }
      };

      const scopeData = {
        status: 'completed',
        detected_scope: detectedRenovationScope,
        target_rooms: detectedTargetRooms,
        is_micro_intervention: isMicroIntervention,
        timestamp: new Date().toISOString(),
        conversation_summary: conversationText.substring(0, 500)
      };

      // Extract conversational response (remove hidden tag)
      let conversationalResponse = aiResponse;
      const tagIndex = aiResponse.indexOf('<!--INTERVIEW_COMPLETE');
      if (tagIndex > 0) {
        conversationalResponse = aiResponse.substring(0, tagIndex).trim();
      }

      // Update lead with all detected data including full conversation
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          status: 'interview_completed',
          renovation_scope: detectedRenovationScope,
          target_rooms: detectedTargetRooms.length > 0 ? detectedTargetRooms : null,
          scope_json: scopeData,
          interview_data: interviewData
        })
        .eq('id', leadId);

      if (updateError) {
        console.error('❌ Failed to update lead:', updateError);
      } else {
        console.log('✅ Lead updated successfully with full conversation:', { detectedRenovationScope, detectedTargetRooms, isMicroIntervention, messageCount: messages.length });
      }

      return new Response(JSON.stringify({ 
        response: conversationalResponse,
        interview_complete: true,
        collected_data: interviewData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If not complete, return response without completion
    return new Response(JSON.stringify({ 
      response: aiResponse,
      interview_complete: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-interview function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred during the interview'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});