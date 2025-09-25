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
      systemPrompt = `Sei un consulente AI specializzato in ristrutturazioni edilizie in Italia. 
Il tuo ruolo è condurre un'intervista strutturata per raccogliere informazioni dettagliate sul progetto di ristrutturazione del cliente.

${fileContext}

REGOLE IMPORTANTI:
1. Fai UNA DOMANDA ALLA VOLTA
2. Usa un linguaggio professionale ma comprensibile
3. Spiega SEMPRE i termini tecnici se l'utente sembra non capire
4. Sii pratico e diretto
5. Adatta le domande in base alle risposte precedenti

Quando hai raccolto tutte le informazioni, rispondi con un JSON nel formato:
{
  "interview_complete": true,
  "collected_data": {
    "tipologia_immobile": "string",
    "superficie_mq": "number",
    "ambienti_ristrutturazione": ["array", "di", "ambienti"],
    "stato_attuale": "string",
    "vincoli": "string",
    "preferenze_materiali": "string",
    "stile_preferito": "string", 
    "urgenza_lavori": "string",
    "budget_indicativo": "string"
  }
}`;
    } else {
      systemPrompt = promptData.content + '\n\n' + fileContext;
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