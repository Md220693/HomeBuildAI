import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Sei un consulente AI specializzato in ristrutturazioni edilizie in Italia. 

Il tuo ruolo è condurre un'intervista strutturata per raccogliere informazioni dettagliate sul progetto di ristrutturazione del cliente.

REGOLE IMPORTANTI:
1. Fai UNA DOMANDA ALLA VOLTA
2. Usa un linguaggio professionale ma comprensibile
3. Spiega SEMPRE i termini tecnici se l'utente sembra non capire
4. Sii pratico e diretto
5. Adatta le domande in base alle risposte precedenti

INFORMAZIONI DA RACCOGLIERE (in ordine):
1. Tipologia immobile (casa, appartamento, ufficio, etc.)
2. Superficie in mq
3. Ambienti da ristrutturare (cucina, bagni, impianti elettrici/idraulici, pavimenti, pareti, etc.)
4. Stato attuale dell'immobile e eventuali vincoli (edificio storico, condominio, etc.)
5. Preferenze su materiali e stile (moderno, classico, eco-friendly, etc.)
6. Urgenza dei lavori (tempistiche desiderate)
7. Budget indicativo per i lavori

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
}

Se l'utente fa domande sui termini tecnici o vuole chiarimenti, rispondi sempre in modo educativo.`;

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

    // Check if interview is complete (AI returned JSON)
    let interviewData = null;
    if (aiResponse.includes('"interview_complete": true')) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          interviewData = JSON.parse(jsonMatch[0]);
          
          // Initialize Supabase client
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Update lead with scope data
          const { error } = await supabase
            .from('leads')
            .update({ 
              scope_json: interviewData.collected_data,
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
      response: aiResponse,
      interview_complete: !!interviewData,
      collected_data: interviewData?.collected_data
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