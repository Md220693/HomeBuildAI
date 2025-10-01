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

    let systemPrompt;
    if (promptError || !promptData) {
      console.warn('No active system_interview prompt found, using fallback');
      systemPrompt = `Tu sei un intervistatore AI per ristrutturazioni. Raccogli informazioni in modo conversazionale.

${fileContext}

${scopeContext}

SEQUENZA:
1. Localizzazione (città, CAP)
2. Scope: casa completa o solo alcuni ambienti?
3. Se single-room: concentrati SOLO su quell'ambiente
4. Caratteristiche, stato, interventi, qualità, budget

UNA DOMANDA ALLA VOLTA (max 40 parole).
NON generare preventivi o capitolati.

COMPLETAMENTO: "Perfetto! Procedo con il capitolato."
POI: <!--INTERVIEW_COMPLETE:{"scope":"[full/partial]","ambiente":"[se partial]"}-->`;
    } else {
      systemPrompt = `${promptData.content}

${fileContext}

${scopeContext}`;
    }

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
    
    // MINIMAL SAFETY CHECK: Only prevent extreme inappropriate responses
    // Allow all technical construction terms
    const shouldForceComplete = 
      aiResponse.length > 1000 && 
      /preventivo\s+vincolante|€\s*\d+[\d.,]*\s*-\s*€\s*\d+[\d.,]*/.test(aiResponse);
    
    if (shouldForceComplete) {
      console.warn('⚠️  Response too detailed, forcing completion');
      aiResponse = "Perfetto! Ho tutte le informazioni. Procedo con il capitolato.";
      aiResponse += '\n<!--INTERVIEW_COMPLETE:{"status":"force_completed","reason":"safety_trigger"}-->';
    }

    console.log('Processed AI response:', aiResponse);

    // Check if interview is complete (AI returned hidden JSON tag)
    let interviewData = null;
    let conversationalResponse = aiResponse;
    let forceCompletion = false;
    
    if (aiResponse.includes('<!--INTERVIEW_COMPLETE:')) {
      try {
        // More robust extraction with multiple fallbacks
        let jsonMatch = aiResponse.match(/<!--INTERVIEW_COMPLETE:(.*?)-->/s);
        
        if (!jsonMatch) {
          // Fallback: try to find the tag without closing
          jsonMatch = aiResponse.match(/<!--INTERVIEW_COMPLETE:(.*)$/s);
        }
        
        if (jsonMatch) {
          let jsonString = jsonMatch[1].trim();
          
          // Clean up common JSON issues
          jsonString = jsonString.replace(/\n/g, '').replace(/\r/g, '');
          
          // Try to extract only valid JSON part
          const jsonStart = jsonString.indexOf('{');
          const jsonEnd = jsonString.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
          }
          
          console.log('Extracted JSON string:', jsonString);
          
          try {
            interviewData = JSON.parse(jsonString);
            console.log('Successfully parsed interview data:', interviewData);
          } catch (parseError2) {
            console.warn('JSON parse failed, using fallback data:', parseError2);
            // Fallback: create basic completion data
            interviewData = {
              status: 'completed',
              timestamp: new Date().toISOString(),
              fallback: true
            };
          }
          
          // Extract conversational part more safely
          const tagIndex = aiResponse.indexOf('<!--INTERVIEW_COMPLETE:');
          if (tagIndex > 0) {
            conversationalResponse = aiResponse.substring(0, tagIndex).trim();
          } else {
            conversationalResponse = "Perfetto! Procedo con il capitolato.";
          }
          
          // Extract scope info from interview data
          const isPartialRenovation = 
            interviewData.scope === 'parziale' || 
            interviewData.scope === 'partial' ||
            (interviewData.ambiente && interviewData.ambiente !== 'intera casa');
          
          const targetRooms = isPartialRenovation && interviewData.ambiente 
            ? [interviewData.ambiente]
            : null;
          
          // Update lead with scope data
          const { error } = await supabase
            .from('leads')
            .update({ 
              scope_json: interviewData,
              status: 'interview_completed',
              renovation_scope: isPartialRenovation ? 'partial' : 'full',
              target_rooms: targetRooms
            })
            .eq('id', leadId);

          if (error) {
            console.error('Database update error:', error);
            throw new Error('Failed to save interview data');
          }

          console.log('✅ Lead updated successfully with scope data');
          forceCompletion = true;
        }
      } catch (parseError) {
        console.error('🚨 Error in completion processing:', parseError);
        
        // EMERGENCY FALLBACK: Force completion anyway
        console.log('🔧 Applying emergency fallback completion');
        interviewData = {
          status: 'emergency_completed',
          timestamp: new Date().toISOString(),
          error: parseError instanceof Error ? parseError.message : String(parseError)
        };
        
        conversationalResponse = "Perfetto! Procedo con il capitolato.";
        forceCompletion = true;
        
        // Still try to update the database
        try {
          await supabase
            .from('leads')
            .update({ 
              scope_json: interviewData,
              status: 'interview_completed'
            })
            .eq('id', leadId);
          console.log('✅ Emergency fallback: Lead updated');
        } catch (dbError) {
          console.error('❌ Emergency fallback: Database update failed:', dbError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      response: conversationalResponse,
      interview_complete: !!interviewData,
      collected_data: interviewData
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