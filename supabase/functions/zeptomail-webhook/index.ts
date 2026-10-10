import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "ZeptoMail webhook endpoint - POST only"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let payload;
    try {
      payload = await req.json();
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Webhook received but could not parse JSON"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("ZeptoMail Webhook received:", JSON.stringify(payload, null, 2));

    const eventName = payload.event_name?.[0];
    const eventMessage = payload.event_message?.[0];

    if (!eventMessage) {
      console.error("No event_message found in payload");
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Webhook received but missing event_message"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailInfo = eventMessage.email_info;
    const recipient = emailInfo?.to?.[0];
    const emailReference = eventMessage.email_reference;
    const clientReference = emailInfo?.client_reference;

    if (!recipient?.email_address) {
      console.error("No recipient email found in payload");
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Webhook received but missing recipient email"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientEmail = recipient.email_address.toLowerCase();

    let quoteId = clientReference;

    if (!quoteId) {
      const { data: quotes } = await supabase
        .from("quote_submissions")
        .select("id")
        .ilike("email", recipientEmail)
        .order("created_at", { ascending: false })
        .limit(1);

      if (quotes && quotes.length > 0) {
        quoteId = quotes[0].id;
        console.log(`Found quote_id ${quoteId} for email ${recipientEmail}`);
      } else {
        console.warn(`No quote found for email ${recipientEmail}`);
      }
    }

    let eventType: string;
    let clickUrl: string | null = null;
    let bounceType: string | null = null;
    let bounceReason: string | null = null;
    let userAgent: string | null = null;
    let ipAddress: string | null = null;

    switch (eventName) {
      case "email_open":
        eventType = "open";
        userAgent = eventMessage.user_agent || null;
        break;
      case "email_click":
        eventType = "click";
        clickUrl = eventMessage.click_url || null;
        userAgent = eventMessage.user_agent || null;
        break;
      case "email_soft_bounce":
        eventType = "soft_bounce";
        bounceType = eventMessage.bounce_type || "soft";
        bounceReason = eventMessage.bounce_reason || "Unknown soft bounce";
        break;
      case "email_hard_bounce":
        eventType = "hard_bounce";
        bounceType = eventMessage.bounce_type || "hard";
        bounceReason = eventMessage.bounce_reason || "Unknown hard bounce";
        break;
      case "email_delivered":
        eventType = "delivered";
        break;
      case "email_failed":
        eventType = "failed";
        bounceReason = eventMessage.bounce_reason || "Unknown failure";
        break;
      case "email_sent":
        eventType = "sent";
        break;
      default:
        console.warn(`Unknown event type: ${eventName}`);
        eventType = eventName || "unknown";
    }

    const { data: eventData, error: insertError } = await supabase
      .from("email_tracking_events")
      .insert({
        quote_id: quoteId || null,
        email_address: recipientEmail,
        event_type: eventType,
        event_data: payload,
        email_reference: emailReference || null,
        client_reference: clientReference || null,
        user_agent: userAgent,
        ip_address: ipAddress,
        click_url: clickUrl,
        bounce_type: bounceType,
        bounce_reason: bounceReason,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting email event:", insertError);
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Webhook received but database error occurred",
          note: "Event logged in console"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully tracked ${eventType} event for ${recipientEmail}`);

    if (eventType === "delivered" && quoteId) {
      const { error: updateError } = await supabase
        .from("quote_submissions")
        .update({
          customer_estimate_sent: true,
          customer_estimate_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", quoteId);

      if (updateError) {
        console.error(`Error updating quote ${quoteId}:`, updateError);
      } else {
        console.log(`Updated quote ${quoteId} with delivery confirmation`);
      }
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Email event tracked successfully",
        event_type: eventType,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Webhook received but internal error occurred",
        note: "Error logged in console"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
