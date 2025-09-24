import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const capitolatoPrompt = `Sei un esperto consulente edile specializzato nella creazione di capitolati tecnici dettagliati per ristrutturazioni in Italia.

Basandoti sui dati raccolti dall'intervista, genera un capitolato strutturato e una stima costi professionale.

STRUTTURA CAPITOLATO RICHIESTA:
1. DEMOLIZIONI E PREPARAZIONE
2. IMPIANTI ELETTRICI
3. IMPIANTI IDRAULICI/TERMICI  
4. MURATURE E TRAMEZZI
5. MASSETTI E SOTTOFONDI
6. PAVIMENTI E RIVESTIMENTI
7. SERRAMENTI E INFISSI
8. PITTURAZIONI E FINITURE
9. OPERE ACCESSORIE

Per ogni sezione, includi:
- Descrizione tecnica delle lavorazioni
- Materiali specificati 
- Unità di misura (mq, ml, n°, ecc.)
- Quantità stimate

STIMA COSTI:
- Calcola un range realistico min-max in euro
- Base prezzi di mercato Italia 2024
- Considera: superficie, qualità materiali, complessità
- Confidence level 0.6-0.85 basato su completezza dati

Rispondi SOLO con questo JSON:
{
  "capitolato": {
    "demolizioni": {
      "descrizione": "string",
      "lavorazioni": ["array di lavorazioni"],
      "materiali": ["array materiali"], 
      "quantita_stimate": "string"
    },
    "impianti_elettrici": {
      "descrizione": "string",
      "lavorazioni": ["array"],
      "materiali": ["array"],
      "quantita_stimate": "string"
    },
    "impianti_idraulici": {
      "descrizione": "string", 
      "lavorazioni": ["array"],
      "materiali": ["array"],
      "quantita_stimate": "string"
    },
    "murature": {
      "descrizione": "string",
      "lavorazioni": ["array"],
      "materiali": ["array"], 
      "quantita_stimate": "string"
    },
    "massetti": {
      "descrizione": "string",
      "lavorazioni": ["array"],
      "materiali": ["array"],
      "quantita_stimate": "string"
    },
    "pavimenti": {
      "descrizione": "string",
      "lavorazioni": ["array"],
      "materiali": ["array"],
      "quantita_stimate": "string"
    },
    "serramenti": {
      "descrizione": "string", 
      "lavorazioni": ["array"],
      "materiali": ["array"],
      "quantita_stimate": "string"
    },
    "pitturazioni": {
      "descrizione": "string",
      "lavorazioni": ["array"], 
      "materiali": ["array"],
      "quantita_stimate": "string"
    },
    "opere_accessorie": {
      "descrizione": "string",
      "lavorazioni": ["array"],
      "materiali": ["array"],
      "quantita_stimate": "string"
    }
  },
  "stima_costi": {
    "min_euro": number,
    "max_euro": number,
    "confidence": number
  }
}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    
    if (!leadId) {
      throw new Error('leadId is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead data with scope
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('scope_json')
      .eq('id', leadId)
      .single();

    if (leadError || !lead?.scope_json) {
      throw new Error('Lead data not found or incomplete');
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    // Prepare prompt with lead data
    const scopeData = JSON.stringify(lead.scope_json, null, 2);
    const fullPrompt = `${capitolatoPrompt}\n\nDATI PROGETTO:\n${scopeData}`;

    console.log('Generating capitolato for lead:', leadId);

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: fullPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('DeepSeek response:', aiResponse);

    // Parse JSON response
    let capitolatoData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      capitolatoData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse capitolato data');
    }

    // Validate required fields
    if (!capitolatoData.capitolato || !capitolatoData.stima_costi) {
      throw new Error('Invalid capitolato structure');
    }

    const { min_euro, max_euro, confidence } = capitolatoData.stima_costi;

    // Update lead with capitolato data
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        capitolato_data: capitolatoData.capitolato,
        cost_estimate_min: min_euro,
        cost_estimate_max: max_euro,
        confidence: confidence,
        status: 'capitolato_generated'
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save capitolato data');
    }

    console.log('Capitolato generated and saved successfully');

    return new Response(JSON.stringify({
      success: true,
      capitolato: capitolatoData.capitolato,
      stima_costi: capitolatoData.stima_costi
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-capitolato function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An error occurred generating the capitolato'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});