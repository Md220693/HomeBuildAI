import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Prompt will be retrieved from database

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

    // Get capitolato prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('kind', 'system_pricing')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData?.content) {
      throw new Error('Capitolato prompt not found in database');
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    // Prepare prompt with lead data
    const scopeData = JSON.stringify(lead.scope_json, null, 2);
    const fullPrompt = `${promptData.content}\n\nDATI PROGETTO:\n${scopeData}`;

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

    // Parse response: extract user message and JSON data
    let userMessage = '';
    let capitolatoData;
    
    try {
      // Check if response contains hidden JSON tag
      const hiddenJsonMatch = aiResponse.match(/<!--CAPITOLATO_COMPLETE:\s*(\{[\s\S]*?\})\s*-->/);
      
      if (hiddenJsonMatch) {
        // Extract user message (everything before the hidden tag)
        userMessage = aiResponse.split('<!--CAPITOLATO_COMPLETE:')[0].trim();
        // Parse the JSON from the hidden tag
        capitolatoData = JSON.parse(hiddenJsonMatch[1]);
      } else {
        // Fallback: try to extract JSON as before (for backward compatibility)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        capitolatoData = JSON.parse(jsonMatch[0]);
        userMessage = '✅ Capitolato generato con successo!';
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Response:', aiResponse);
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