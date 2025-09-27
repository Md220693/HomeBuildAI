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

    // Get lead data to check for existing files
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('planimetria_url, foto_urls')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead data:', leadError);
      throw new Error('Failed to fetch lead data');
    }

    console.log('Lead file data:', leadData);

    // Get system interview prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('kind', 'system_interview')
      .eq('is_active', true)
      .single();

    // Build file context information
    const hasFiles = leadData?.planimetria_url || (leadData?.foto_urls && leadData.foto_urls.length > 0);
    const fileContext = hasFiles ? `
IMPORTANTE: IL CLIENTE HA GIÀ CARICATO I FILE NECESSARI:
- Planimetria: ${leadData?.planimetria_url ? 'SÌ' : 'NO'}
- Foto: ${leadData?.foto_urls ? `SÌ (${leadData.foto_urls.length} foto)` : 'NO'}

NON CHIEDERE AL CLIENTE DI CARICARE NUOVAMENTE I FILE. Procedi direttamente con le domande dell'intervista.
` : `
ATTENZIONE: IL CLIENTE NON HA ANCORA CARICATO I FILE NECESSARI:
- Planimetria: necessaria
- Foto: necessarie (almeno 4)

Chiedi al cliente di caricare questi file prima di procedere con l'intervista.
`;

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

IMPORTANTE: La PRIMA domanda dopo aver verificato i file deve SEMPRE essere sulla localizzazione:
"Dove si trova l'immobile da ristrutturare? (Città, zona/quartiere e CAP se lo conosci)"

Non procedere con altre domande finché non hai ottenuto la localizzazione.`;
    }

    // Prepare messages for DeepSeek API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log('Calling DeepSeek API with messages:', apiMessages);

    // Call DeepSeek API with stricter constraints
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        max_tokens: 150, // Drastically reduced to force short responses
        temperature: 0.3, // Lower temperature for more predictable responses
        stop: ['<!--', 'CAPITOLATO', 'STIMA', 'COSTO', '€'], // Stop tokens
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
    
    // SAFETY CHECK: Detect inappropriate content and truncate
    const forbiddenKeywords = ['capitolato', 'stima', 'costo', 'prezzo', '€', 'euro', 'preventivo', 'CAPITOLATO', 'STIMA'];
    const containsForbidden = forbiddenKeywords.some(keyword => aiResponse.toLowerCase().includes(keyword.toLowerCase()));
    
    if (containsForbidden) {
      console.warn('🚨 SAFETY ALERT: AI generated inappropriate content:', aiResponse.substring(0, 200));
      
      // Force truncate at first forbidden word
      const firstForbidden = forbiddenKeywords.find(keyword => aiResponse.toLowerCase().includes(keyword.toLowerCase()));
      if (firstForbidden) {
        const cutIndex = aiResponse.toLowerCase().indexOf(firstForbidden.toLowerCase());
        aiResponse = aiResponse.substring(0, cutIndex).trim();
        
        // Add completion if response is now too short
        if (aiResponse.length < 20) {
          aiResponse = "Perfetto! Procedo con il capitolato.";
          aiResponse += '\n<!--INTERVIEW_COMPLETE:{"status":"force_completed","reason":"inappropriate_content"}-->';
        }
      }
    }
    
    // Additional safety: Truncate responses longer than 300 characters
    if (aiResponse.length > 300 && !aiResponse.includes('<!--INTERVIEW_COMPLETE:')) {
      console.warn('🚨 SAFETY ALERT: Response too long, truncating:', aiResponse.length);
      aiResponse = aiResponse.substring(0, 250).trim() + '...';
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