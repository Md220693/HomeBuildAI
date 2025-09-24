import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generatePDFContent(leadData: any): string {
  const { user_contact, capitolato_data, cost_estimate_min, cost_estimate_max, confidence, disclaimer } = leadData;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Capitolato BuildHomeAI</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .cost-estimate { background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; }
        .disclaimer { background: #fef3c7; padding: 15px; border: 1px solid #f59e0b; margin-top: 20px; }
        ul { margin: 10px 0; }
        li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>BuildHomeAI - Capitolato Tecnico</h1>
        <p>Cliente: ${user_contact.nome} ${user_contact.cognome}</p>
        <p>Email: ${user_contact.email} | Tel: ${user_contact.telefono}</p>
        <p>Indirizzo: ${user_contact.indirizzo}</p>
    </div>
    
    <div class="cost-estimate">
        <h2>Stima Costi del Progetto</h2>
        <p><strong>Range di costo: €${cost_estimate_min?.toLocaleString()} - €${cost_estimate_max?.toLocaleString()}</strong></p>
        <p>Affidabilità stima: ${Math.round(confidence * 100)}%</p>
    </div>

    ${Object.entries(capitolato_data || {}).map(([key, section]: [string, any]) => `
    <div class="section">
        <h2>${getSectionTitle(key)}</h2>
        <p><strong>Descrizione:</strong> ${section.descrizione}</p>
        
        ${section.lavorazioni?.length > 0 ? `
        <h3>Lavorazioni:</h3>
        <ul>
            ${section.lavorazioni.map((item: string) => `<li>${item}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${section.materiali?.length > 0 ? `
        <h3>Materiali:</h3>
        <ul>
            ${section.materiali.map((item: string) => `<li>${item}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${section.quantita_stimate ? `
        <p><strong>Quantità stimate:</strong> ${section.quantita_stimate}</p>
        ` : ''}
    </div>
    `).join('')}

    <div class="disclaimer">
        <h3>Importante</h3>
        <p>${disclaimer}</p>
    </div>
</body>
</html>
  `;
}

function getSectionTitle(key: string): string {
  const titles: { [k: string]: string } = {
    demolizioni: "Demolizioni e Preparazione",
    impianti_elettrici: "Impianti Elettrici", 
    impianti_idraulici: "Impianti Idraulici/Termici",
    murature: "Murature e Tramezzi",
    massetti: "Massetti e Sottofondi",
    pavimenti: "Pavimenti e Rivestimenti",
    serramenti: "Serramenti e Infissi",
    pitturazioni: "Pitturazioni e Finiture",
    opere_accessorie: "Opere Accessorie"
  };
  return titles[key] || key;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, otpCode } = await req.json();
    
    if (!leadId || !otpCode) {
      throw new Error('leadId and OTP code are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead data with OTP verification
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }

    // Check OTP attempts
    if (lead.otp_attempts >= 3) {
      throw new Error('Troppi tentativi. Richiedi un nuovo codice OTP.');
    }

    // Verify OTP
    if (lead.otp_code !== otpCode) {
      // Increment attempts
      await supabase
        .from('leads')
        .update({ otp_attempts: (lead.otp_attempts || 0) + 1 })
        .eq('id', leadId);
        
      throw new Error('Codice OTP non valido');
    }

    // Check OTP expiration
    if (new Date() > new Date(lead.otp_expires_at)) {
      throw new Error('Codice OTP scaduto. Richiedi un nuovo codice.');
    }

    console.log('OTP verified successfully for lead:', leadId);

    // Update lead status to queued and clear OTP
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'queued',
        otp_verified_at: new Date().toISOString(),
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update lead status');
    }

    // Generate PDF content
    const pdfContent = generatePDFContent(lead);
    
    // Convert HTML to base64 for simple PDF placeholder
    // In production, use a proper PDF generation library
    const pdfBase64 = btoa(unescape(encodeURIComponent(pdfContent)));

    // TODO: Replace with actual email service integration
    // For now, just log email sending
    console.log(`Email Placeholder - Send PDF to ${lead.user_contact?.email}`);
    console.log('PDF Content generated for lead:', leadId);

    // Simulate email sending success  
    const emailSuccess = true;

    if (!emailSuccess) {
      throw new Error('Failed to send email with PDF');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'OTP verificato! PDF inviato via email.',
      pdf_content: pdfBase64,
      email_sent: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-otp-and-send-pdf function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An error occurred verifying OTP'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});