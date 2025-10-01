import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { leadId } = await req.json();
    
    if (!leadId) {
      throw new Error('leadId is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get capitolato prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('kind', 'system_pricing')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData?.content) {
      throw new Error('System prompt not found or inactive');
    }

    // Get lead data with scope
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('scope_json, renovation_scope, target_rooms')
      .eq('id', leadId)
      .single();

    if (leadError || !lead?.scope_json) {
      throw new Error('Lead data not found or incomplete');
    }

    // FIX FASE 2: Enhanced scope detection and micro-intervention handling
    let isPartialRenovation = lead.renovation_scope === 'partial';
    const targetRooms = lead.target_rooms || [];
    
    // FALLBACK: Auto-detect partial from scope_json if renovation_scope is unknown
    if (lead.renovation_scope === 'unknown' || !lead.renovation_scope) {
      const scopeText = JSON.stringify(lead.scope_json).toLowerCase();
      const partialIndicators = ['solo', 'bagno', 'cucina', 'intonaco', 'soffitto', 'pittura'];
      const hasPartialIndicators = partialIndicators.some(ind => scopeText.includes(ind));
      
      if (hasPartialIndicators) {
        console.log('🔍 Auto-detected partial renovation from scope_json');
        isPartialRenovation = true;
      }
    }
    
    // Detect micro-interventions (very small jobs like "only plaster")
    const scopeText = JSON.stringify(lead.scope_json).toLowerCase();
    const isMicroIntervention = 
      (scopeText.includes('solo intonaco') || 
       scopeText.includes('solo pittura') ||
       scopeText.includes('solo soffitto') ||
       scopeText.includes('piccola riparazione')) &&
      !scopeText.includes('completa') &&
      !scopeText.includes('totale');
    
    let scopeContext = '';
    if (isMicroIntervention) {
      scopeContext = `
🎯 MICRO-INTERVENTO RILEVATO:
- Lavoro estremamente limitato: ${targetRooms.length > 0 ? targetRooms.join(', ') : 'intervento specifico'}
- CREA un capitolato MINIMALE con SOLO le voci necessarie
- Stima realistica: 200-800€ per lavori tipo intonaco/pittura piccoli
- NON generare tutte le 9 sezioni standard - solo quelle pertinenti
- Esempio: per "solo intonaco soffitto" → solo sezioni "pitturazioni" e eventualmente "opere_accessorie"
`;
    } else if (isPartialRenovation && targetRooms.length > 0) {
      scopeContext = `
IMPORTANTE - RISTRUTTURAZIONE PARZIALE:
- L'utente vuole ristrutturare SOLO: ${targetRooms.join(', ')}
- NON includere nel capitolato lavori su altri ambienti
- Concentrati ESCLUSIVAMENTE sugli ambienti indicati
- Le quantità devono essere realistiche per l'ambiente specifico
- La stima costi deve essere proporzionata allo scope limitato
`;
    } else {
      scopeContext = `
RISTRUTTURAZIONE COMPLETA:
- Include tutti gli ambienti dell'immobile
- Considera demolizioni, impianti, finiture per tutta la casa
`;
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    // Prepare prompt with lead data and scope context
    const scopeData = JSON.stringify(lead.scope_json, null, 2);
    const fullPrompt = `${promptData.content}

${scopeContext}

DATI PROGETTO:
${scopeData}`;

    console.log('Generating capitolato for lead:', leadId, 'scope:', lead.renovation_scope);

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

    // Parse response - extract user message and JSON data
    let capitolatoData;
    let userMessage = '';
    
    try {
      // Look for the hidden JSON in the AI response
      const hiddenJsonMatch = aiResponse.match(/<!--CAPITOLATO_COMPLETE:\s*({[\s\S]*?})\s*-->/);
      if (!hiddenJsonMatch) {
        // Fallback to old format for backward compatibility
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        capitolatoData = JSON.parse(jsonMatch[0]);
        userMessage = '✅ Capitolato generato con successo!';
      } else {
        // New format - extract both message and JSON
        const beforeHidden = aiResponse.split('<!--CAPITOLATO_COMPLETE:')[0].trim();
        userMessage = beforeHidden || '✅ Capitolato generato con successo!';
        capitolatoData = JSON.parse(hiddenJsonMatch[1]);
      }
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