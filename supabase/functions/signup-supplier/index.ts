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
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log(`Supplier signup request for: ${email}`);

    // Create admin client to check system settings
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if email confirmation is required
    const { data: settingData, error: settingError } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'supplier_email_confirmation_required')
      .maybeSingle();

    if (settingError) {
      console.error('Error fetching email confirmation setting:', settingError);
    }

    const emailConfirmRequired = settingData?.setting_value === 'true';
    console.log(`Email confirmation required: ${emailConfirmRequired}`);

    let authResponse;

    if (emailConfirmRequired) {
      // Use normal anon client for standard signup with email confirmation
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      authResponse = await supabaseClient.auth.signUp({
        email,
        password,
      });
    } else {
      // Use admin client to create user with auto-confirm
      authResponse = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
      });
    }

    if (authResponse.error) {
      console.error('Error during signup:', authResponse.error);
      throw authResponse.error;
    }

    console.log(`User created successfully: ${authResponse.data.user?.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        user: authResponse.data.user,
        email_confirm_required: emailConfirmRequired
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in signup-supplier:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
