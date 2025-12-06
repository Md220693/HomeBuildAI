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


async function sendEmailWithPDF(toEmail: string, userName: string, pdfUrl: string) {
  const apiKey = Deno.env.get("POSTMARK_SERVER_TOKEN");
  const sender = Deno.env.get("POSTMARK_SENDER_EMAIL");

  if (!apiKey || !sender) {
    console.error("Missing Postmark config");
    return false;
  }

  const emailData = {
    MessageStream: "outbound",
    From: `BuildHomeAI <${sender}>`,
    To: toEmail,
    Subject: "Il tuo Capitolato Tecnico",
    HtmlBody: `
      <p>Ciao ${userName},</p>
      <p>Il tuo capitolato tecnico è pronto.</p>
      <p><a href="${pdfUrl}">Scarica il PDF</a></p>
    `,
    TextBody: `Il tuo PDF è pronto: ${pdfUrl}`,
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
      emailSent = await sendEmailWithPDF(lead.user_contact.email, name, pdfUrl);
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
