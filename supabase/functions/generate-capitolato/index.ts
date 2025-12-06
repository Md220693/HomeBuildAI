import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    
    if (!leadId) {
      throw new Error('leadId is required');
    }

  
    const supabaseUrl = Deno.env.get('URL')!;
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

  
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('kind', 'system_pricing')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData?.content) {
      throw new Error('System prompt not found or inactive');
    }

  
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('interview_data, renovation_scope, target_rooms')
      .eq('id', leadId)
      .single();

    if (leadError || !lead?.interview_data) {
      throw new Error('Lead data not found or incomplete');
    }


    let renovationScope = lead.interview_data?.renovation_scope || 
                          lead.renovation_scope || 
                          'unknown';
    let targetRooms = lead.interview_data?.target_rooms || 
                      lead.target_rooms || 
                      [];
    let isMicroIntervention = lead.interview_data?.is_micro_intervention || false;
    
  
    const allDataText = JSON.stringify({
      interview_data: lead.interview_data,
      renovation_scope: renovationScope,
      target_rooms: targetRooms
    }).toLowerCase();
    
    console.log('Analyzing scope from data:', allDataText.substring(0, 300));
    
  
    const partialIndicators = [
      'solo bagno', 'solo cucina', 'solo intonaco', 'solo pittura',
      'partial', 'parziale', 'bagno', '6mq', 'soffitto', 'tetto'
    ];
    
    if (renovationScope === 'unknown' || renovationScope === null) {
      const hasPartial = partialIndicators.some(ind => allDataText.includes(ind));
      if (hasPartial) {
        renovationScope = 'partial';
        console.log('🔍 Auto-detected PARTIAL scope');
        
       
        if (targetRooms.length === 0) {
          if (allDataText.includes('bagno')) targetRooms = ['bagno'];
          else if (allDataText.includes('cucina')) targetRooms = ['cucina'];
          else if (allDataText.includes('camera')) targetRooms = ['camera'];
        }
      }
    }
    
  
    const microKeywords = [
      'solo intonaco', 'solo pittura', 'intonacatura', 'tetto del bagno',
      'soffitto del bagno', 'micro', '6mq', '6 mq', 'piccola riparazione'
    ];
    
    const hasMicroKeywords = microKeywords.some(kw => allDataText.includes(kw));
    const hasCompleteKeywords = allDataText.includes('completa') || allDataText.includes('totale');
    
    if (hasMicroKeywords && !hasCompleteKeywords) {
      isMicroIntervention = true;
      renovationScope = 'partial';
      console.log('🎯 MICRO-INTERVENTION detected!');
    }
    
    console.log('Final scope decision:', { renovationScope, targetRooms, isMicroIntervention });
    
  
    let scopeContext = '';
    if (isMicroIntervention) {
      const room = targetRooms.length > 0 ? targetRooms[0] : 'ambiente';
      scopeContext = `
⚠️ ATTENZIONE: MICRO-INTERVENTO - NON RISTRUTTURAZIONE COMPLETA!

Dati indicano: intervento MINIMO su ${room} (es. solo intonaco soffitto, solo pittura)

ISTRUZIONI CRITICHE:
1. Genera SOLO 1-2 capitoli pertinenti (es. "Pitturazioni" per intonaco)
2. Stima REALISTICA: €200-€600 per micro-interventi
3. NON inventare lavori: se dicono "solo intonaco soffitto", NON aggiungere demolizioni, impianti, pavimenti, etc.
4. Quantità proporzionate: es. 6-10mq superficie da trattare

Esempio per "intonaco soffitto bagno 6mq":
{
  "capitolato": {
    "pitturazioni": {
      "descrizione": "Ripristino intonaco soffitto bagno",
      "lavorazioni": ["Rimozione intonaco danneggiato", "Preparazione superficie", "Applicazione intonaco antimuffa", "Finitura liscia"],
      "materiali": ["Intonaco antimuffa", "Primer", "Materiali preparazione"],
      "quantita_stimate": "6-8 mq di soffitto"
    }
  },
  "stima_costi": {
    "min_euro": 300,
    "max_euro": 500,
    "confidence": 0.75
  }
}

NON GENERARE ristrutturazione completa da 60k-90k!`;
    } else if (renovationScope === 'partial' && targetRooms.length > 0) {
      scopeContext = `
RISTRUTTURAZIONE PARZIALE - Solo ${targetRooms.join(', ')}:
- Genera capitoli SOLO per ${targetRooms.join(', ')}
- NON includere altri ambienti
- Stima proporzionata allo scope limitato (€3.000-15.000 a seconda complessità)
`;
    } else if (renovationScope === 'full') {
      scopeContext = `
🏠 RISTRUTTURAZIONE COMPLETA - INTERA CASA:

ISTRUZIONI CRITICHE per CAPITOLATO COMPLETO:

1️⃣ Genera TUTTI i capitoli necessari per casa completa:
   • Demolizioni generali (rimozione pavimenti, rivestimenti, sanitari, mobili)
   • Impianti elettrici completi (quadri, punti luce, prese per TUTTI gli ambienti)
   • Impianti idraulici e termici completi (collettori, tubazioni, sanitari)
   • Murature e tramezzature (eventuali modifiche layout)
   • Massetti e sottofondi (per TUTTA la metratura)
   • Pavimenti (per TUTTI gli ambienti dell'immobile)
   • Serramenti interni (porte per tutte le stanze)
   • Pitturazioni e finiture (TUTTE le pareti e soffitti)
   • Opere accessorie (battiscopa, accessori, pulizie)

2️⃣ Quantità PROPORZIONATE alla metratura TOTALE:
   - Esempio 120mq: demolizioni 120mq, pavimenti 120mq, pitturazioni ~300mq pareti
   - NON limitarti a bagno/cucina se la casa è intera!

3️⃣ STIMA REALISTICA per ristrutturazione completa:
   - Range standard: €500-750/mq (esempio 120mq → €60.000-90.000)
   - Adatta in base a qualità materiali e complessità lavori
   - Confidence 0.70-0.80 per interventi completi

4️⃣ NON sottostimare - Una casa completa richiede:
   - Demolizioni totali
   - Rifacimento completo impianti
   - Nuovi pavimenti ovunque
   - Nuove porte interne
   - Pitturazioni complete

ESEMPIO STIMA per 120mq casa completa:
{
  "stima_costi": {
    "min_euro": 60000,
    "max_euro": 90000,
    "confidence": 0.75
  }
}
`;
    } else {
      scopeContext = `
RISTRUTTURAZIONE - Scope da determinare:
- Analizza dati progetto per capire se completa o parziale
- Genera capitoli appropriati
- Stima proporzionata allo scope rilevato
`;
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }


    const scopeData = JSON.stringify({
      conversation: lead.interview_data.conversation || [],
      location: lead.interview_data.citta && lead.interview_data.cap 
        ? `${lead.interview_data.citta}, ${lead.interview_data.cap}` 
        : 'Location not specified',
      renovation_scope: renovationScope,
      target_rooms: targetRooms,
      is_micro_intervention: isMicroIntervention,
      quality_tier: lead.interview_data.quality_tier || 'standard',
      additional_notes: lead.interview_data.notes || ''
    }, null, 2);
    
    const fullPrompt = `${promptData.content}

${scopeContext}

DATI PROGETTO:
${scopeData}`;

    console.log('Generating capitolato for lead:', leadId, 'scope:', lead.renovation_scope);

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


    let capitolatoData;
    let userMessage = '';
    
    try {

      const hiddenJsonMatch = aiResponse.match(/<!--CAPITOLATO_COMPLETE:\s*({[\s\S]*?})\s*-->/);
      if (!hiddenJsonMatch) {

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        capitolatoData = JSON.parse(jsonMatch[0]);
        userMessage = '✅ Capitolato generato con successo!';
      } else {

        const beforeHidden = aiResponse.split('<!--CAPITOLATO_COMPLETE:')[0].trim();
        userMessage = beforeHidden || '✅ Capitolato generato con successo!';
        capitolatoData = JSON.parse(hiddenJsonMatch[1]);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse capitolato data');
    }

    if (!capitolatoData.capitolato || !capitolatoData.stima_costi) {
      throw new Error('Invalid capitolato structure');
    }

    const { min_euro, max_euro, confidence } = capitolatoData.stima_costi;

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
      message: userMessage,
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