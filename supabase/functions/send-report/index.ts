import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const { email, leadId } = await req.json();

    // Call your existing generate-pdf function
    const generateResponse = await fetch(
      `${Deno.env.get("URL")}/functions/v1/generate-pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ leadId }),
      }
    );

    const pdfResult = await generateResponse.json();

    // Send the report via email (example using Resend API)
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HomeBuildAI <noreply@yourdomain.com>",
        to: email,
        subject: "La tua stima di ristrutturazione",
        html: `<p>Grazie per aver utilizzato HomeBuildAI!</p>
               <p>Puoi scaricare il tuo report PDF qui:</p>
               <a href="${pdfResult.url}">${pdfResult.url}</a>`,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email inviata con successo!" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
