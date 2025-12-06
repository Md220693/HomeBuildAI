import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { setting_key } = await req.json();

    if (!setting_key) {
      throw new Error('setting_key is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('URL') ?? '',
      Deno.env.get('ANON_KEY') ?? ''
    );

    console.log(`Fetching setting: ${setting_key}`);

    const { data, error } = await supabaseClient
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', setting_key)
      .maybeSingle();

    if (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }

    if (!data) {
      console.log(`Setting ${setting_key} not found, returning null`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          setting_key,
          setting_value: null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        setting_key,
        setting_value: data?.setting_value 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-system-setting:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
