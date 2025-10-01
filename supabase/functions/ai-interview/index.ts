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

    // Get lead data to check for existing files and skip flag
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('planimetria_url, foto_urls, skip_files')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead data:', leadError);
      throw new Error('Failed to fetch lead data');
    }

    const hasSkippedFiles = leadData?.skip_files === true;
    const hasPlanimetria = leadData?.planimetria_url != null;
    const hasFoto = leadData?.foto_urls != null && leadData.foto_urls.length >= 4;

    console.log('Lead file data:', { 
      planimetria_url: leadData?.planimetria_url, 
      foto_urls: leadData?.foto_urls,
      skip_files: hasSkippedFiles
    });

    // Get system interview prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('kind', 'system_interview')
      .eq('is_active', true)
      .single();

    // Build file context information based on skip_files flag and uploaded files
    let fileContext = '';
    if (hasSkippedFiles) {
      fileContext = `
IMPORTANTE: L'utente ha scelto di procedere SENZA caricare foto o planimetria.
- NON chiedere mai di caricare file durante l'intervista
- Procedi direttamente con le domande per raccogliere tutte le informazioni necessarie
- Fai domande più dettagliate per compensare la mancanza di documenti visivi
- Chiedi specifiche su dimensioni, stato attuale, e dettagli degli ambienti da ristrutturare
`;
    } else if (hasPlanimetria || hasFoto) {
      fileContext = `
OTTIMO: L'utente ha caricato ${hasPlanimetria ? 'la planimetria' : ''}${hasPlanimetria && hasFoto ? ' e ' : ''}${hasFoto ? `${leadData.foto_urls.length} foto` : ''}.
- Tieni in considerazione questi documenti durante l'intervista
- Puoi fare riferimento ai file caricati quando appropriato
- NON chiedere di caricare altri file
`;
    } else {
      fileContext = `
NOTA: L'utente non ha ancora caricato planimetria o foto.
- Se l'utente le ha con sé, suggerisci gentilmente di caricarle per una valutazione più precisa
- Se non le ha, procedi comunque con domande dettagliate
- Non bloccare l'intervista per i file mancanti
`;
    }

    let systemPrompt;
    if (promptError || !promptData) {
      console.warn('No active system_interview prompt found, using fallback');
      // Ultra-rigid fallback prompt
      systemPrompt = `Tu sei ESCLUSIVAMENTE un RACCOGLITORE DI INFORMAZIONI per progetti di ristrutturazione. NIENT'ALTRO.

${fileContext}

🚫 VIETATO ASSOLUTO:
- NON scrivere capitolati, preventivi, stime di costo
- NON dare consigli tecnici o raccomandazioni
- NON usare parole: "capitolato", "stima", "costo", "prezzo", "€", "euro", "preventivo"
- NON superare 50 parole per risposta
- NON generare contenuti oltre la semplice domanda

✅ PUOI SOLO:
- Fare UNA domanda breve alla volta (max 25 parole)
- Raccogliere le risposte dell'utente
- Passare alla domanda successiva

SEQUENZA RIGIDA:
1. "Dove si trova l'immobile? (via, città, CAP)"
2. "Che tipo di immobile e quanti mq?"
3. "Piano, ascensore, anno costruzione?"
4. "Stato impianti attuali?"
5. "Quali lavori vuoi fare?"
6. "Budget orientativo?"
7. "Quando vuoi iniziare?"

FINE INTERVISTA: Quando hai TUTTE le risposte, scrivi ESATTAMENTE:
"Perfetto! Procedo con il capitolato."

POI aggiungi SOLO il tag:
<!--INTERVIEW_COMPLETE:{"dati":"raccolti"}-->`;
    } else {
      systemPrompt = `${promptData.content}

${fileContext}

IMPORTANTE: Domanda iniziale obbligatoria:
- Chiedi sempre come PRIMA domanda: "Dove si trova l'immobile da ristrutturare? (Città, zona/quartiere e CAP se lo conosci)"
- Non procedere finché non hai la localizzazione

IMPORTANTE: Scope del progetto:
- Dopo la localizzazione, chiedi esplicitamente: "Vuoi ristrutturare l'intera casa o solo alcuni ambienti specifici?"
- Se risponde "solo un ambiente" (es. solo bagno, solo cucina), adatta TUTTE le domande successive a quel singolo ambiente
- Non fare domande su altri ambienti se il cliente vuole ristrutturare solo uno specifico
- Per ristrutturazioni parziali, concentrati su: dimensioni dell'ambiente, stato attuale, lavori specifici richiesti, materiali desiderati`;
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
    
    // IMPROVED SAFETY CHECK: Only block truly inappropriate content
    // Allow technical terms like "capitolato" and "stima" when in proper context
    const inappropriatePatterns = [
      /capitolato\s+preliminare.*strutturato/i, // Full capitolato generation
      /stima\s+di\s+costo.*range/i, // Detailed cost estimates with ranges
      /€\s*\d+[\d.,]*\s*-\s*€\s*\d+/i, // Specific euro ranges like "€20,000 - €40,000"
      /preventivo\s+vincolante/i, // Binding quotes
    ];
    
    const containsInappropriate = inappropriatePatterns.some(pattern => pattern.test(aiResponse));
    
    if (containsInappropriate) {
      console.warn('🚨 SAFETY ALERT: AI generated inappropriate content:', aiResponse.substring(0, 200));
      
      // Truncate at the start of inappropriate content
      for (const pattern of inappropriatePatterns) {
        const match = aiResponse.match(pattern);
        if (match && match.index !== undefined) {
          aiResponse = aiResponse.substring(0, match.index).trim();
          
          // Add completion if response is now too short
          if (aiResponse.length < 20) {
            aiResponse = "Perfetto! Procedo con il capitolato.";
            aiResponse += '\n<!--INTERVIEW_COMPLETE:{"status":"force_completed","reason":"inappropriate_content"}-->';
          }
          break;
        }
      }
    }
    
    // Additional safety: Only truncate extremely long responses (>500 chars)
    if (aiResponse.length > 500 && !aiResponse.includes('<!--INTERVIEW_COMPLETE:')) {
      console.warn('🚨 SAFETY ALERT: Response too long, truncating:', aiResponse.length);
      // Find the last complete sentence before 450 chars
      const truncateAt = aiResponse.lastIndexOf('.', 450);
      if (truncateAt > 200) {
        aiResponse = aiResponse.substring(0, truncateAt + 1).trim();
      } else {
        aiResponse = aiResponse.substring(0, 450).trim() + '...';
      }
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
          
          // Update lead with scope data
          const { error } = await supabase
            .from('leads')
            .update({ 
              scope_json: interviewData,
              status: 'interview_completed'
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