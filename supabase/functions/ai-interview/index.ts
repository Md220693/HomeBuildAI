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
      // Fallback prompt if none found in database
      systemPrompt = `Sei un consulente AI che conduce SOLO INTERVISTE per raccogliere dati su ristrutturazioni. 

${fileContext}

RUOLO: SOLO INTERVISTATORE - NON generare stime, capitolati o prezzi.

REGOLE FERME:
1. Fai UNA DOMANDA ALLA VOLTA
2. Sii breve e diretto (massimo 3-4 righe per risposta)
3. NON fornire mai stime di costo o consigli tecnici
4. SOLO raccogliere informazioni

DOMANDE IN ORDINE:
1. OBBLIGATORIO: Localizzazione completa (via, città, CAP)
2. Tipo immobile e superficie
3. Piano, ascensore, anno costruzione  
4. Stato attuale impianti
5. Ambiti ristrutturazione
6. Budget orientativo
7. Tempistiche

COMPLETAMENTO: Quando hai tutti i dati essenziali, scrivi SOLO:
"Perfetto! Ho raccolto tutte le informazioni necessarie. Procedo ora a generare il tuo capitolato personalizzato."

POI aggiungi il tag nascosto:
<!--INTERVIEW_COMPLETE:{dati raccolti}-->`;
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

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('DeepSeek response:', aiResponse);

    // Check if interview is complete (AI returned hidden JSON tag)
    let interviewData = null;
    let conversationalResponse = aiResponse;
    
    if (aiResponse.includes('<!--INTERVIEW_COMPLETE:')) {
      try {
        // Extract the JSON from the hidden comment
        const jsonMatch = aiResponse.match(/<!--INTERVIEW_COMPLETE:(.*?)-->/s);
        if (jsonMatch) {
          interviewData = JSON.parse(jsonMatch[1]);
          
          // Extract only the conversational part (everything before the hidden tag)
          const conversationEnd = aiResponse.indexOf('<!--INTERVIEW_COMPLETE:');
          conversationalResponse = aiResponse.substring(0, conversationEnd).trim();
          
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

          console.log('Lead updated successfully with scope data');
        }
      } catch (parseError) {
        console.error('Error parsing interview data:', parseError);
        // Continue anyway, don't break the flow
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