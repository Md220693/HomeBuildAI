import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
//import { supabase } from "@/integrations/supabase/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type NotifyPayload = {
  leadId: string;
  supplierUserIds: string[];
};

async function sendPostmarkEmail(to: string, subject: string, html: string, text: string) {
  const apiKey = Deno.env.get("POSTMARK_SERVER_TOKEN");
  const sender = Deno.env.get("POSTMARK_SENDER_EMAIL");

  if (!apiKey || !sender) {
    console.error("Missing Postmark env variables");
    return false;
  }

  const res = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      MessageStream: "outbound",
      From: `HomeBuildAI <${sender}>`,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      Tag: "new-lead",
    }),
  });

  return res.ok;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, supplierUserIds }: NotifyPayload = await req.json();

    if (!leadId || !supplierUserIds?.length) {
      throw new Error("leadId and supplierUserIds are required");
    }

    const supabase = createClient(
      Deno.env.get("URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    /* ------------------ IN-APP NOTIFICATIONS ------------------ */

    const notifications = supplierUserIds.map((userId) => ({
      user_id: userId,
      title: "Nuovo lead disponibile",
      body: "È disponibile un nuovo lead nella tua area.",
      link: "/fornitori/dashboard",
      read: false,
    }));

/* ================= NOTIFICATIONS ================= */

// 1️⃣ ADMIN NOTIFICATION
const { data: admins } = await supabase
  .from("user_roles")
  .select("user_id")
  .eq("role", "admin");

if (admins?.length) {
  await supabase.from("notifications").insert(
    admins.map((a) => ({
      user_id: a.user_id,
      type: "new_lead",
      payload: {
        title: "Nuovo lead",
        message: "È stato creato un nuovo lead",
        lead_id: leadId,
        role: "admin",
      },
    }))
  );
}

// 2️⃣ SUPPLIER NOTIFICATIONS
await supabase.from("notifications").insert(
  supplierUserIds.map((uid) => ({
    user_id: uid,
    type: "new_lead",
    payload: {
      title: "Nuovo lead disponibile",
      message: "È disponibile un nuovo lead per te",
      lead_id: leadId,
      role: "supplier",
    },
  }))
);

    /* ------------------ EMAIL NOTIFICATIONS ------------------ */

    const { data: users } = await supabase
      .from("profiles")
      .select("email")
      .in("id", supplierUserIds);

    if (users?.length) {
      for (const user of users) {
        const html = `
          <h2>🚀 Nuovo lead disponibile</h2>
          <p>Un nuovo lead è stato assegnato alla tua azienda.</p>
          <p>
            <a href="https://www.homebuildai.site/fornitori/dashboard">
              Accedi alla dashboard
            </a>
          </p>
        `;

        const text = `
Nuovo lead disponibile

Accedi alla dashboard fornitori:
https://www.homebuildai.site/fornitori/dashboard
        `;

        await sendPostmarkEmail(
          user.email,
          "Nuovo lead disponibile",
          html,
          text
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify_new_lead error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
