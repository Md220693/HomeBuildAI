import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmailWithPostmark(to: string, subject: string, htmlBody: string, textBody: string, pdfUrl?: string) {
  const postmarkToken = Deno.env.get('postmark');
  
  if (!postmarkToken) {
    console.log('Postmark token not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailData: any = {
      From: 'BuildHomeAI <noreply@buildhomeai.com>',
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: 'outbound'
    };

    if (pdfUrl) {
     emailData.Attachments = [{
        Name: 'Capitolato_BuildHomeAI.pdf',
        ContentType: 'application/pdf',
        ContentID: 'capitolato-pdf'
      }];
    
    }

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkToken
      },
      body: JSON.stringify(emailData)
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, otpCode } = await req.json();
    
    if (!leadId || !otpCode) {
      throw new Error('leadId and OTP code are required');
    }

    const supabaseUrl = Deno.env.get('URL')!;
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);


    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    console.log("TYPE user_contact:", typeof lead.user_contact);
    console.log("VALUE user_contact:", lead.user_contact);
    console.log("Full lead object:", lead);

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }


    if (lead.otp_attempts >= 3) {
      throw new Error('Troppi tentativi. Richiedi un nuovo codice OTP.');
    }

    if (lead.otp_code !== otpCode) {
  
      await supabase
        .from('leads')
        .update({ otp_attempts: (lead.otp_attempts || 0) + 1 })
        .eq('id', leadId);
        
      throw new Error('Codice OTP non valido');
    }


    if (new Date() > new Date(lead.otp_expires_at)) {
      throw new Error('Codice OTP scaduto. Richiedi un nuovo codice.');
    }

    console.log('OTP verified successfully for lead:', leadId);


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


    console.log('Generating PDF for lead:', leadId);
    
    const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
      body: { leadId }
    });

    if (pdfError || pdfData.error) {
      console.error('PDF generation error:', pdfError || pdfData.error);
      
    }

    const pdfUrl = pdfData?.pdf_url;

    
    console.log(`Sending PDF email to ${lead.user_contact?.email}`);
    
    const emailResult = await sendEmailWithPostmark(
      lead.user_contact?.email,
      'Il tuo Capitolato BuildHomeAI è pronto!',
      `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Grazie per aver scelto BuildHomeAI!</h2>
            <p>Ciao ${lead.user_contact?.nome},</p>
            <p>Il tuo capitolato tecnico personalizzato è pronto.</p>
            <p><strong>Stima del progetto:</strong> €${lead.cost_estimate_min?.toLocaleString()} - €${lead.cost_estimate_max?.toLocaleString()}</p>
            ${pdfUrl ? `<p><a href="${pdfUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Scarica il Capitolato PDF</a></p>` : ''}
            <p style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <strong>Importante:</strong> ${lead.disclaimer || 'La stima è indicativa e basata sui dati forniti. È necessario un sopralluogo per preventivo vincolante.'}
            </p>
            <p style="margin-top: 20px;">A breve sarai contattato dai nostri fornitori qualificati per un sopralluogo gratuito.</p>
            <p>Il Team BuildHomeAI</p>
          </body>
        </html>
      `,
      `Grazie per aver scelto BuildHomeAI!\n\nCiao ${lead.user_contact?.nome},\n\nIl tuo capitolato tecnico personalizzato è pronto.\n\nStima del progetto: €${lead.cost_estimate_min?.toLocaleString()} - €${lead.cost_estimate_max?.toLocaleString()}\n\n${pdfUrl ? `Scarica il PDF: ${pdfUrl}\n\n` : ''}Importante: ${lead.disclaimer || 'La stima è indicativa e basata sui dati forniti. È necessario un sopralluogo per preventivo vincolante.'}\n\nA breve sarai contattato dai nostri fornitori qualificati per un sopralluogo gratuito.\n\nIl Team BuildHomeAI`,
      pdfUrl
    );

    const emailSuccess = emailResult.success;

    if (!emailSuccess) {
      console.warn('Failed to send email, but OTP verification succeeded');
    }

    return new Response(JSON.stringify({
      success: true,
      message: emailSuccess ? 'OTP verificato! PDF inviato via email.' : 'OTP verificato! Email non inviata (servizio non configurato).',
      pdf_url: pdfUrl,
      email_sent: emailSuccess
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