export async function sendCapitolatoEmail({ to, name, pdfUrl }: {
  to: string;
  name: string;
  pdfUrl: string;
}) {
  const apiKey = Deno.env.get("POSTMARK_SERVER_TOKEN");
  const sender = Deno.env.get("POSTMARK_SENDER_EMAIL");

  if (!apiKey || !sender) {
    console.error("Postmark configuration missing");
    return false;
  }

  const emailData = {
    MessageStream: "outbound",
    From: `HomeBuildAI <${sender}>`,
    To: to,
    Subject: "Il tuo Capitolato Tecnico è pronto",
    HtmlBody: `
      <p>Ciao ${name},</p>
      <p>Il tuo capitolato tecnico è stato generato con successo.</p>
      <p><a href="${pdfUrl}" style="font-weight:bold;">Scarica il tuo PDF</a></p>
      <p>Un saluto,<br/>Il team di HomeBuildAI</p>

      <img src="https://ibzrnleunnfjyddyjkxg.supabase.co/storage/v1/object/public/email-assets/homebuilsignature.png"
           width="180" style="margin-top:10px;" />
    `,
    TextBody: `
Ciao ${name},

Il tuo capitolato tecnico è pronto.

Scarica il PDF: ${pdfUrl}

Un saluto,
HomeBuildAI
    `,
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
