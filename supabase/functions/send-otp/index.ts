import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, contactData } = await req.json();
    
    if (!leadId || !contactData?.telefono) {
      throw new Error('leadId and phone number are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP for lead:', leadId, 'Code:', otpCode);

    // Save contact data and OTP to database
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        user_contact: contactData,
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt.toISOString(),
        otp_attempts: 0
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save contact data');
    }

    // TODO: Replace with real SMS provider integration
    // For now, just log the OTP (in production, send SMS)
    console.log(`SMS OTP Placeholder - Send to ${contactData.telefono}: Your BuildHomeAI OTP is: ${otpCode}`);
    
    // Simulate SMS sending success
    const smsSuccess = true;

    if (!smsSuccess) {
      throw new Error('Failed to send SMS OTP');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'OTP inviato con successo',
      // In development, return OTP for testing - REMOVE IN PRODUCTION
      debug_otp: otpCode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An error occurred sending OTP'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});