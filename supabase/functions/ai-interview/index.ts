import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Helper function to map CAP to Regione
function mapCapToRegione(cap: string | null): string | null {
  if (!cap) return null;
  
  const capNum = parseInt(cap);
  if (isNaN(capNum)) return null;
  
  // Map CAP ranges to regions (Italian postal code system)
  if (capNum >= 10000 && capNum <= 10999) return 'Piemonte';
  if (capNum >= 12000 && capNum <= 14999) return 'Piemonte';
  if (capNum >= 15000 && capNum <= 18999) return 'Piemonte';
  if (capNum >= 20000 && capNum <= 20999) return 'Lombardia';
  if (capNum >= 22000 && capNum <= 27100) return 'Lombardia';
  if (capNum >= 30000 && capNum <= 30399) return 'Veneto';
  if (capNum >= 31000 && capNum <= 32999) return 'Veneto';
  if (capNum >= 35000 && capNum <= 36199) return 'Veneto';
  if (capNum >= 37000 && capNum <= 37139) return 'Veneto';
  if (capNum >= 38000 && capNum <= 38999) return 'Trentino-Alto Adige';
  if (capNum >= 39000 && capNum <= 39999) return 'Trentino-Alto Adige';
  if (capNum >= 33000 && capNum <= 34999) return 'Friuli-Venezia Giulia';
  if (capNum >= 16000 && capNum <= 19999) return 'Liguria';
  if (capNum >= 40000 && capNum <= 43999) return 'Emilia-Romagna';
  if (capNum >= 44000 && capNum <= 48999) return 'Emilia-Romagna';
  if (capNum >= 47000 && capNum <= 47999) return 'Emilia-Romagna';
  if (capNum >= 50000 && capNum <= 59999) return 'Toscana';
  if (capNum >= 6000 && capNum <= 6999) return 'Umbria';
  if (capNum >= 60000 && capNum <= 63999) return 'Marche';
  if (capNum >= 0 && capNum <= 5999) return 'Lazio';
  if (capNum >= 65000 && capNum <= 67999) return 'Abruzzo';
  if (capNum >= 86000 && capNum <= 86999) return 'Molise';
  if (capNum >= 70000 && capNum <= 76999) return 'Puglia';
  if (capNum >= 85000 && capNum <= 85999) return 'Basilicata';
  if (capNum >= 80000 && capNum <= 84999) return 'Campania';
  if (capNum >= 87000 && capNum <= 89999) return 'Calabria';
  if (capNum >= 90000 && capNum <= 98999) return 'Sicilia';
  if (capNum >= 7000 && capNum <= 9999) return 'Sardegna';
  
  return null;
}

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
      1. In quale CITTÀ e CAP si trova l'immobile? (es: Milano, 20100) - OBBLIGATORIO
      2. Cosa vuoi ristrutturare? (tutta la casa o solo un ambiente?)
      3. Quanti mq?
      4. Che lavori servono?
      5. Qualità materiali? (economico/standard/premium)
      6. Budget orientativo?
      7. OBBLIGATORIO: "Per inviarti il capitolato, qual è la tua EMAIL?" (chiedi SEMPRE dopo budget)

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
      
      ⚠️ VALIDAZIONE OBBLIGATORIA PRIMA DI COMPLETARE:
      - Email DEVE essere presente (formato valido: xxx@yyy.zzz)
      - Location DEVE contenere CITTÀ e CAP a 5 cifre (es: Milano, 20100)
      - Se manca UNO di questi dati, NON completare l'intervista
      - Chiedi di nuovo gentilmente i dati mancanti prima di procedere

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
    const conversationOriginal = messages.map((m: any) => m.content).join(' ');
    const conversationText = conversationOriginal.toLowerCase();
    let detectedRenovationScope = 'unknown';
    let detectedTargetRooms: string[] = [];
    let isMicroIntervention = false;
    
    // Extract email from conversation
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = conversationOriginal.match(emailRegex);
    const detectedEmail = emailMatches ? emailMatches[emailMatches.length - 1] : null;
    
    // Helper: Normalize city name to Title Case
    const normalizeCity = (city: string) => {
      return city.trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Extract location (city + CAP) - ULTRA-ROBUST: case-insensitive multi-strategy
    let detectedCitta: string | null = null;
    let detectedCap: string | null = null;

    // Strategy 1: City + CAP (case-insensitive, flexible spacing/comma)
    const locationMatch = conversationOriginal.match(/([a-zàèéìòùáíóúäëïöüâêîôûçñ\s'-]{3,}),?\s*(\d{5})/i);
    if (locationMatch) {
      detectedCitta = normalizeCity(locationMatch[1]);
      detectedCap = locationMatch[2];
    }

    // Strategy 2: If no city but CAP found, try phrase extraction
    if (!detectedCitta) {
      const capOnly = conversationOriginal.match(/\b(\d{5})\b/);
      if (capOnly) {
        detectedCap = capOnly[1];
        // Try to find city before CAP
        const cityBeforeCap = conversationOriginal.match(/([a-zàèéìòùáíóúäëïöüâêîôûçñ\s'-]{3,})\s*,?\s*\d{5}/i);
        if (cityBeforeCap) {
          detectedCitta = normalizeCity(cityBeforeCap[1]);
        }
      }
    }
    
    // Extract nome and cognome from conversation
    const nomeMatch = conversationOriginal.match(/(?:nome|mi chiamo|sono)\s*[:\s]+([A-ZÀÈÉÌÒÙ][a-zàèéìòù]+)/i);
    const cognomeMatch = conversationOriginal.match(/cognome\s*[:\s]+([A-ZÀÈÉÌÒÙ][a-zàèéìòù]+)/i);
    const detectedNome = nomeMatch?.[1]?.trim() || null;
    const detectedCognome = cognomeMatch?.[1]?.trim() || null;
    
    console.log('🗺️ Location extracted:', { 
      detectedCitta, 
      detectedCap, 
      regione: mapCapToRegione(detectedCap),
      normalized: detectedCitta ? `✅ "${detectedCitta}"` : '❌ not found'
    });
    console.log('👤 Contact extracted:', { detectedNome, detectedCognome, detectedEmail });
    console.log('📍 RAW input sample:', conversationOriginal.substring(0, 300));

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
    
    // ====== PRE-COMPLETION VALIDATION (CRITICAL) ======
    const hasValidLocation = detectedCap && detectedCitta;
    const hasValidEmail = detectedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detectedEmail);
    
    // If AI wants to complete but essential data is missing, force re-prompt
    if ((isComplete || hasCompletionPhrase) && (!hasValidEmail || !hasValidLocation)) {
      const missingInfo = [];
      if (!hasValidEmail) missingInfo.push('email');
      if (!hasValidLocation) missingInfo.push('città e CAP (es: Milano, 20100)');
      
      console.log('⚠️ Blocking completion - missing data:', missingInfo);
      
      return new Response(JSON.stringify({
        response: `Prima di completare, ho bisogno di: ${missingInfo.join(', ')}. Puoi fornirmeli?`,
        interview_complete: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // TRIGGER AUTO-COMPLETION if ANY fallback is met
    if (isComplete || 
        (detectedRenovationScope !== 'unknown' && hasCompletionPhrase) ||
        userRefusedBudget ||
        messageThresholdReached) {
      console.log('💾 Saving interview completion data...');
      
      // Build comprehensive interview_data with location at root level
      const interviewData = {
        location: detectedCap ? `${detectedCitta}, ${detectedCap}` : 'Non specificato',
        client_info: { 
          email: detectedEmail,
          nome: detectedNome,
          cognome: detectedCognome
        },
        project_details: {
          city: detectedCitta,
          postal_code: detectedCap,
          renovation_scope: detectedRenovationScope,
          target_rooms: detectedTargetRooms,
          is_micro_intervention: isMicroIntervention
        },
        conversation: messages,
        scope_detected: detectedRenovationScope,
        target_rooms: detectedTargetRooms,
        is_micro_intervention: isMicroIntervention,
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

      // Update lead with interview completion + geographical data + contact info
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          status: 'interview_completed',
          user_contact: {
            nome: detectedNome,
            cognome: detectedCognome,
            email: detectedEmail,
            telefono: null,
            indirizzo: detectedCitta && detectedCap ? `${detectedCitta}, ${detectedCap}` : null
          },
          renovation_scope: detectedRenovationScope,
          target_rooms: detectedTargetRooms.length > 0 ? detectedTargetRooms : null,
          scope_json: scopeData,
          interview_data: interviewData,
          cap: detectedCap,
          citta: detectedCitta,
          regione: mapCapToRegione(detectedCap)
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