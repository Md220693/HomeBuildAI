import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function fetchCapitolato(leadId: string) {
  const url =
    "https://ibzrnleunnfjyddyjkxg.supabase.co/functions/v1/generate-capitolato";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({ leadId }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("generate-capitolato error:", err);
    throw new Error("Failed to generate capitolato");
  }

  const json = await response.json();

  if (!json.capitolato || !json.stima_costi) {
    throw new Error("Invalid capitolato structure received");
  }

  return json;
}


async function generatePDF(lead: any, capitolatoResponse: any) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]);
  let y = 800;

  
  page.drawText("Capitolato Tecnico", {
    x: 40,
    y,
    size: 22,
    font: bold,
  });

  y -= 35;

  page.drawText(
    `Cliente: ${lead.user_contact?.nome || ""} ${
      lead.user_contact?.cognome || ""
    }`,
    { x: 40, y, size: 12, font }
  );

  y -= 18;

  page.drawText(`Email: ${lead.user_contact?.email || "-"}`, {
    x: 40,
    y,
    size: 12,
    font,
  });

  y -= 25;

  // BASIC INFO
  page.drawText("Informazioni Lead", {
    x: 40,
    y,
    size: 14,
    font: bold,
  });

  y -= 20;

  const leadInfo = [
    `Lead ID: ${lead.id}`,
    `Data generazione: ${new Date().toLocaleString()}`,
  ];

  leadInfo.forEach((line) => {
    page.drawText(line, { x: 40, y, size: 11, font });
    y -= 16;
  });

  y -= 10;


  page.drawText("Capitolato:", {
    x: 40,
    y,
    size: 14,
    font: bold,
  });

  y -= 20;

  const capitolato = capitolatoResponse.capitolato;
  const stima = capitolatoResponse.stima_costi;


  function drawWrapped(text: string, size = 11) {
    const maxWidth = 500;
    const words = text.split(" ");
    let line = "";

    for (const w of words) {
      const width = font.widthOfTextAtSize(line + w, size);
      if (width > maxWidth) {
        page.drawText(line, { x: 40, y, size, font });
        y -= 14;
        line = w + " ";
      } else {
        line += w + " ";
      }
    }

    if (line.trim().length > 0) {
      page.drawText(line, { x: 40, y, size, font });
      y -= 14;
    }
  }


  for (const chapter in capitolato) {
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    page.drawText(chapter.toUpperCase(), { x: 40, y, size: 13, font: bold });
    y -= 18;

    const section = capitolato[chapter];

    for (const key in section) {
      drawWrapped(`• ${key}: ${JSON.stringify(section[key])}`);
    }

    y -= 10;
  }


  page.drawText("Stima Costi:", {
    x: 40,
    y,
    size: 14,
    font: bold,
  });

  y -= 22;

  drawWrapped(`Min: €${stima.min_euro}`);
  drawWrapped(`Max: €${stima.max_euro}`);
  drawWrapped(`Confidence: ${stima.confidence}`);


  return await pdfDoc.save();
}


async function sendEmailWithPDF(toEmail: string, userName: string, lead: any, pdfUrl: string) {
  const apiKey = Deno.env.get("POSTMARK_SERVER_TOKEN");
  const sender = Deno.env.get("POSTMARK_SENDER_EMAIL");

  if (!apiKey || !sender) {
    console.error("Missing Postmark config");
    return false;
  }

  const htmlBody = `
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
          Il tuo capitolato tecnico personalizzato è pronto.
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
          Puoi scaricare il PDF cliccando il link qui sotto:
        </p>

        <p style="margin: 20px 0;">
          <a href="${pdfUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            📄 Scarica il Capitolato Tecnico
          </a>
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
          <img src="https://ibzrnleunnfjyddyjkxg.supabase.co/storage/v1/object/public/email-assets/homebuildsig.JPG" alt="HomeBuildAI" style="width: 220px; max-width: 220px; display: block; margin: 0 auto; margin-top: 12px;">
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
            Questo è un messaggio automatico, si prega di non rispondere a questa email.
          </p>
        </div>
      </body>
    </html>
  `;

  const textBody = `
HOMEBUILDAI - Capitolato Tecnico

Buongiorno ${userName || lead.user_contact?.nome || 'Cliente'},

Il tuo capitolato tecnico personalizzato è pronto.

DETTAGLI DEL PROGETTO:
- Stima: €${lead.cost_estimate_min?.toLocaleString('it-IT')} - €${lead.cost_estimate_max?.toLocaleString('it-IT')}
- Affidabilità: ${Math.round((lead.confidence || 0.75) * 100)}%
- Data: ${new Date(lead.updated_at || lead.created_at).toLocaleDateString('it-IT')}

Scarica il PDF dal seguente link:
${pdfUrl}

IMPORTANTE:
${lead.disclaimer || 'La stima è indicativa e basata sui dati forniti. È necessario un sopralluogo per preventivo vincolante.'}

--
Il Team HomeBuildAI
info@homebuildai.site | www.homebuildai.site
Non rispondere a questa email.
  `;

  const emailData = {
    MessageStream: "outbound",
    From: `HomeBuildAI <${sender}>`,
    To: toEmail,
    Subject: "Il tuo Capitolato Tecnico è pronto",
    HtmlBody: htmlBody,
    TextBody: textBody,
    Tag: "capitolato",
  };

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  return response.ok;
}



serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { leadId, sendEmail = true } = await req.json();
    if (!leadId) throw new Error("leadId is required");

    const supabase = createClient(
      Deno.env.get("URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );


    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) throw new Error("Lead not found");


    const capitolatoData = await fetchCapitolato(leadId);


    const pdfBytes = await generatePDF(lead, capitolatoData);
    const fileName = `report-${leadId}.pdf`;

  
    const { error: uploadError } = await supabase.storage
      .from("leads-uploads")
      .upload(`pdfs/${fileName}`, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);


    const { data: urlData } = await supabase.storage
      .from("leads-uploads")
      .getPublicUrl(`pdfs/${fileName}`);

    const pdfUrl = urlData.publicUrl;


    await supabase
      .from("leads")
      .update({
        pdf_url: pdfUrl,
        status: "report_delivered",
        report_delivered_at: new Date().toISOString(),
      })
      .eq("id", leadId);

  
    let emailSent = false;
    if (sendEmail && lead.user_contact?.email) {
      const name = `${lead.user_contact?.nome || ""} ${lead.user_contact?.cognome || ""}`.trim();
      emailSent = await sendEmailWithPDF(lead.user_contact.email, name, lead, pdfUrl);
    }

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: pdfUrl,
        email_sent: emailSent,
        capitolato_used: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
