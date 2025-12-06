import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async () => {
  const POSTMARK_SERVER_TOKEN = Deno.env.get("POSTMARK_SERVER_TOKEN");

  const emailData = {
    From: "noreply@homebuildai.site",
    To: "test@example.com",
    Subject: "Postmark Test Email",
    HtmlBody: "<h1>Hello from Supabase!</h1><p>This is a test email.</p>",
    MessageStream: "outbound"
  };

  const res = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  const json = await res.json();
  return new Response(JSON.stringify(json), {
    headers: { "Content-Type": "application/json" },
  });
});
