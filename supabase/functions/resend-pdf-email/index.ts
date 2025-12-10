import "https://deno.land/x/xhr@0.1.0/mod.ts"; 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmailWithPostmark(to: string, subject: string, htmlBody: string, textBody: string, pdfUrl?: string) {
  const postmarkToken = Deno.env.get('POSTMARK_SERVER_TOKEN');
  const senderEmail = Deno.env.get('POSTMARK_SENDER_EMAIL') || 'HomeBuildAI <noreply@homebuildai.site>';
  
  console.log('Postmark token configured:', !!postmarkToken);
  console.log('Sender email from env:', senderEmail);
  
  if (!postmarkToken) {
    console.error('POSTMARK_SERVER_TOKEN not configured');
    console.log('Available environment variables:', Object.keys(Deno.env.toObject()));
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailData: any = {
      From: senderEmail, // Use the email from environment variable
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: 'outbound'
    };

    if (pdfUrl) {
      console.log('Attempting to download PDF from:', pdfUrl);
      
      try {
        const pdfResponse = await fetch(pdfUrl);
        if (pdfResponse.ok) {
          const pdfBuffer = await pdfResponse.arrayBuffer();
          const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
          
          emailData.Attachments = [{
            Name: 'Capitolato_HomeBuildAI.pdf',
            ContentType: 'application/pdf',
            Content: pdfBase64
          }];
          console.log('PDF attached successfully');
        } else {
          console.warn('Failed to download PDF from URL:', pdfUrl, 'Status:', pdfResponse.status);
        }
      } catch (pdfError) {
        console.error('Error downloading PDF:', pdfError);
      }
    }

    console.log('Sending email to:', to);
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
      console.error('Postmark API error:', response.status, errorData);
      return { success: false, error: `Failed to send email: ${response.status}` };
    }

    const data = await response.json();
    console.log('Email sent successfully via Postmark:', data.MessageID);
    return { success: true, messageId: data.MessageID };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Resend PDF email function called');
    
    const { leadId, email, pdfUrl, userName } = await req.json();
    
    console.log('Request data:', { leadId, email, pdfUrl: !!pdfUrl, userName });
    
    if (!leadId || !email) {
      throw new Error('leadId and email are required');
    }

    const supabaseUrl = Deno.env.get('URL');
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY');
    
    console.log('Supabase URL configured:', !!supabaseUrl);
    console.log('Supabase key configured:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      console.log('Available env vars:', Object.keys(Deno.env.toObject()));
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('Lead not found:', leadError);
      throw new Error('Lead not found');
    }

    console.log('Lead found:', lead.id, 'PDF URL:', lead.pdf_url);

    const finalPdfUrl = pdfUrl || lead.pdf_url;
    console.log('Using PDF URL:', finalPdfUrl);

    const emailResult = await sendEmailWithPostmark(
      email,
      'HomeBuildAI - Il tuo Capitolato Tecnico è stato rinviato',
      `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 10px;">
                🏠 HomeBuildAI
              </h1>
              <p style="color: #4b5563; font-size: 16px;">
                Il tuo partner per ristrutturazioni intelligenti
              </p>
            </div>
            
            <h2 style="color: #1e40af;">Buongiorno ${userName || lead.user_contact?.nome || 'Cliente'},</h2>
            <p style="color: #374151; line-height: 1.6;">
              Come richiesto, ti rinviiamo il tuo capitolato tecnico personalizzato.
            </p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">📋 Dettagli del progetto:</h3>
              <ul style="color: #374151; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Stima del progetto:</strong> €${lead.cost_estimate_min?.toLocaleString('it-IT') || '0'} - €${lead.cost_estimate_max?.toLocaleString('it-IT') || '0'}</li>
                <li style="margin-bottom: 8px;"><strong>Affidabilità stima:</strong> ${Math.round((lead.confidence || 0.75) * 100)}%</li>
                <li style="margin-bottom: 8px;"><strong>Data generazione:</strong> ${new Date(lead.updated_at || lead.created_at).toLocaleDateString('it-IT')}</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Il PDF <strong>"Capitolato_HomeBuildAI.pdf"</strong> è allegato a questa email.
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
              <h4 style="color: #92400e; margin-top: 0;">⚠️ Importante</h4>
              <p style="color: #92400e; margin-bottom: 0; line-height: 1.6;">
                ${lead.disclaimer || 'La stima è indicativa e basata sui dati forniti. È necessario un sopralluogo per preventivo vincolante.'}
              </p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>Il Team HomeBuildAI</strong><br>
                📧 info@homebuildai.site | 🌐 www.homebuildai.site
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                Questo è un messaggio automatico, si prega di non rispondere a questa email.
              </p>
            </div>
          </body>
        </html>
      `,
      `HOMEBUILDAI - Capitolato Tecnico (Rinvio)

Buongiorno ${userName || lead.user_contact?.nome || 'Cliente'},

Come richiesto, ti rinviiamo il tuo capitolato tecnico personalizzato.

📋 DETTAGLI DEL PROGETTO:
- Stima del progetto: €${lead.cost_estimate_min?.toLocaleString('it-IT') || '0'} - €${lead.cost_estimate_max?.toLocaleString('it-IT') || '0'}
- Affidabilità stima: ${Math.round((lead.confidence || 0.75) * 100)}%
- Data generazione: ${new Date(lead.updated_at || lead.created_at).toLocaleDateString('it-IT')}

Il PDF "Capitolato_HomeBuildAI.pdf" è allegato a questa email.

⚠️ IMPORTANTE:
${lead.disclaimer || 'La stima è indicativa e basata sui dati forniti. È necessario un sopralluogo per preventivo vincolante.'}

--
Il Team HomeBuildAI
info@homebuildai.site | www.homebuildai.site

Questo è un messaggio automatico, si prega di non rispondere a questa email.`,
      finalPdfUrl
    );

    console.log('Email result:', emailResult);

    return new Response(
      JSON.stringify({
        success: emailResult.success,
        message: emailResult.success ? 'Email resent successfully' : 'Failed to resend email',
        error: emailResult.error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in resend-pdf-email function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred',
        success: false
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});