import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmailWithPostmark(to: string, subject: string, htmlBody: string, textBody: string) {
  const postmarkToken = Deno.env.get('postmark');
  
  if (!postmarkToken) {
    console.log('Postmark token not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkToken
      },
      body: JSON.stringify({
        From: 'BuildHomeAI <noreply@buildhomeai.com>',
        To: to,
        Subject: subject,
        HtmlBody: htmlBody,
        TextBody: textBody,
        MessageStream: 'outbound'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Postmark API error:', errorData);
      return { success: false, error: 'Failed to send email' };
    }

    const data = await response.json();
    console.log('Email sent successfully via Postmark:', data.MessageID);
    return { success: true, messageId: data.MessageID };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

interface AdminInviteRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }


    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, firstName, lastName, password }: AdminInviteRequest & { password?: string } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    const userPassword = password || '1Cavallo!';

    console.log('Creating admin user for:', email);


    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || 'Admin',
        last_name: lastName || 'User'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create admin user: ' + authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      throw new Error('No user data returned from auth.admin.createUser');
    }

    console.log('Admin user created:', authData.user.id);


    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        role: 'admin',
        first_name: firstName || 'Admin',
        last_name: lastName || 'User'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
  
    }


    const { error: permissionError } = await supabase
      .from('user_permissions')
      .insert({
        user_id: authData.user.id,
        permission: 'manage_users',
        created_by: authData.user.id
      });

    if (permissionError) {
      console.error('Permission error:', permissionError);
    }

    console.log('Admin user created successfully');


    const emailResult = await sendEmailWithPostmark(
      email,
      'Invito a BuildHomeAI Admin Console',
      `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Benvenuto in BuildHomeAI</h2>
            <p>Ciao ${firstName || 'Admin'},</p>
            <p>Sei stato invitato ad accedere alla console di amministrazione BuildHomeAI.</p>
            <p><strong>Email:</strong> ${email}<br>
            <strong>Password temporanea:</strong> ${userPassword}</p>
            <p>Per motivi di sicurezza, ti consigliamo di cambiare la password al primo accesso.</p>
            <p><a href="${supabaseUrl}/auth/v1/verify" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Accedi alla Console</a></p>
            <p>Se hai domande, contatta il supporto tecnico.</p>
            <p>Il Team BuildHomeAI</p>
          </body>
        </html>
      `,
      `Benvenuto in BuildHomeAI\n\nCiao ${firstName || 'Admin'},\n\nSei stato invitato ad accedere alla console di amministrazione BuildHomeAI.\n\nEmail: ${email}\nPassword temporanea: ${userPassword}\n\nPer motivi di sicurezza, ti consigliamo di cambiare la password al primo accesso.\n\nIl Team BuildHomeAI`
    );

    if (!emailResult.success) {
      console.warn('Failed to send invitation email:', emailResult.error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        userId: authData.user.id,
        email: email,
        emailSent: emailResult.success
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in invite-admin function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);