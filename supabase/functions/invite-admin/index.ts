import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminInviteRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { email, firstName, lastName }: AdminInviteRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate temporary password
    const tempPassword = `Admin${Math.random().toString(36).slice(-8)}!`;

    console.log('Creating admin user for:', email);

    // Create admin user with temporary password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
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

    // Create profile with admin role
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
      // Don't fail here, profile might be created by trigger
    }

    // Add admin permissions
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

    console.log('Sending welcome email to:', email);

    // Send welcome email with credentials
    const emailResponse = await resend.emails.send({
      from: 'BuildHomeAI <onboarding@resend.dev>',
      to: [email],
      subject: 'Benvenuto nell\'area Admin - BuildHomeAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Benvenuto nell'area Admin</h1>
          
          <p>Ciao ${firstName || 'Admin'},</p>
          
          <p>Il tuo account amministratore per BuildHomeAI è stato creato con successo!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Credenziali di accesso:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password temporanea:</strong> <code style="background-color: #e0e0e0; padding: 2px 4px; border-radius: 3px;">${tempPassword}</code></p>
          </div>
          
          <p><strong>Importante:</strong> Ti consigliamo vivamente di cambiare la password dopo il primo accesso per motivi di sicurezza.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wncvvncldryfqqvpmnor.supabase.co/admin/auth" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accedi all'Area Admin
            </a>
          </div>
          
          <p>Se hai problemi con l'accesso, contatta il supporto tecnico.</p>
          
          <p>Cordiali saluti,<br>
          Il Team BuildHomeAI</p>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        userId: authData.user.id,
        tempPassword // In production, don't return the password
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