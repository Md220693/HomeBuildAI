import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

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

  
    const supabaseUrl = Deno.env.get('URL')!;
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    
    const { data: debugSetting } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'otp_debug_mode')
      .single();
    
    const debugMode = debugSetting?.setting_value === 'true';

    
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP for lead:', leadId, debugMode ? `Code: ${otpCode}` : 'Code: [hidden]');


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


    let smsSuccess = false;
    

    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    if (twilioSid && twilioToken && twilioPhone && !debugMode) {

      try {
        const auth = btoa(`${twilioSid}:${twilioToken}`);
        const formData = new URLSearchParams();
        formData.append('From', twilioPhone);
        formData.append('To', contactData.telefono);
        formData.append('Body', `Il tuo codice OTP BuildHomeAI è: ${otpCode}. Valido per 10 minuti.`);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });

        if (response.ok) {
          console.log('SMS sent successfully via Twilio');
          smsSuccess = true;
        } else {
          const errorData = await response.text();
          console.error('Twilio SMS error:', errorData);
          throw new Error('Failed to send SMS via Twilio');
        }
      } catch (error) {
        console.error('SMS sending error:', error);
        throw new Error('Failed to send SMS');
      }
    } else {
  
      console.log(`SMS OTP ${debugMode ? 'DEBUG' : 'PLACEHOLDER'} - Send to ${contactData.telefono}: Your BuildHomeAI OTP is: ${otpCode}`);
      smsSuccess = true; // Always succeed in debug mode
    }

    if (!smsSuccess) {
      throw new Error('Failed to send SMS OTP');
    }

    const response: any = {
      success: true,
      message: debugMode ? 'OTP inviato (modalità debug)' : 'OTP inviato con successo'
    };

    if (debugMode) {
      response.debug_otp = otpCode;
    }

    return new Response(JSON.stringify(response), {
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