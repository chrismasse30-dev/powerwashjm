import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MailJetEvent {
  event: string;
  time: number;
  MessageID: number;
  Message_GUID?: string;
  email: string;
  mj_campaign_id?: number;
  mj_contact_id?: number;
  customcampaign?: string;
  CustomID?: string;
  Payload?: string;
  url?: string;
  ip?: string;
  geo?: string;
  agent?: string;
  error_related_to?: string;
  error?: string;
  comment?: string;
  blocked?: boolean;
  hard_bounce?: boolean;
  source?: string;
}

// Internal email addresses that should be excluded from customer tracking
const INTERNAL_EMAILS = [
  'chrismasse30@gmail.com',
  'sales@powerwashjm.com',
  'info@powerwashjm.com',
  'admin@powerwashjm.com'
];

const isInternalEmail = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return INTERNAL_EMAILS.some(internalEmail =>
    normalizedEmail === internalEmail.toLowerCase()
  );
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
        message: "MailJet webhook endpoint - POST only"
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

    let payload: MailJetEvent[];
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

    console.log("MailJet Webhook received:", JSON.stringify(payload, null, 2));

    if (!Array.isArray(payload)) {
      console.error("Payload is not an array");
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Webhook received but invalid format"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const event of payload) {
      try {
        const recipientEmail = event.email?.toLowerCase();

        if (!recipientEmail) {
          console.error("No recipient email found in event");
          continue;
        }

        // Skip ALL events from internal copies (identified by -internal suffix in CustomID)
        if (event.CustomID && event.CustomID.toString().endsWith('-internal')) {
          console.log(`Skipping event from internal copy: ${event.event} for ${recipientEmail} (CustomID: ${event.CustomID})`);
          results.push({
            email: recipientEmail,
            event: event.event,
            status: "skipped",
            reason: "internal_copy"
          });
          continue;
        }

        // Also skip tracking events (opens/clicks) from internal email addresses
        // This is a fallback in case CustomID is not set properly
        const isInternalRecipient = isInternalEmail(recipientEmail);
        if (isInternalRecipient && (event.event === 'open' || event.event === 'click')) {
          console.log(`Skipping ${event.event} event from internal email address: ${recipientEmail}`);
          results.push({
            email: recipientEmail,
            event: event.event,
            status: "skipped",
            reason: "internal_email_address"
          });
          continue;
        }

        let quoteId = event.CustomID;

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

        switch (event.event) {
          case "sent":
            eventType = "sent";
            break;
          case "open":
            eventType = "opened";
            userAgent = event.agent || null;
            ipAddress = event.ip || null;
            break;
          case "click":
            eventType = "clicked";
            clickUrl = event.url || null;
            userAgent = event.agent || null;
            ipAddress = event.ip || null;
            break;
          case "bounce":
            if (event.hard_bounce) {
              eventType = "hard_bounce";
              bounceType = "hard";
            } else {
              eventType = "soft_bounce";
              bounceType = "soft";
            }
            bounceReason = event.error || event.comment || "Unknown bounce reason";
            break;
          case "blocked":
            eventType = "blocked";
            bounceReason = event.error || event.comment || "Email blocked";
            break;
          case "spam":
            eventType = "spam";
            break;
          case "unsub":
            eventType = "unsub";
            break;
          default:
            console.warn(`Unknown MailJet event type: ${event.event}`);
            eventType = event.event || "unknown";
        }

        const { data: eventData, error: insertError } = await supabase
          .from("email_tracking_events")
          .insert({
            quote_id: quoteId || null,
            email_address: recipientEmail,
            event_type: eventType,
            event_data: event,
            email_reference: event.Message_GUID || null,
            client_reference: event.CustomID || null,
            user_agent: userAgent,
            ip_address: ipAddress,
            click_url: clickUrl,
            bounce_type: bounceType,
            bounce_reason: bounceReason,
            email_provider: 'mailjet',
            message_id: event.MessageID?.toString() || null,
            custom_id: event.CustomID || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting email event:", insertError);
          results.push({
            email: recipientEmail,
            event: event.event,
            status: "error",
            error: insertError.message
          });
          continue;
        }

        console.log(`Successfully tracked ${eventType} event for ${recipientEmail} via MailJet`);

        if (eventType === "sent" && quoteId) {
          const { error: updateError } = await supabase
            .from("quote_submissions")
            .update({
              customer_estimate_sent: true,
              customer_estimate_sent_at: new Date(event.time * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", quoteId);

          if (updateError) {
            console.error(`Error updating quote ${quoteId}:`, updateError);
          } else {
            console.log(`Updated quote ${quoteId} with MailJet delivery confirmation`);
          }
        }

        results.push({
          email: recipientEmail,
          event: event.event,
          status: "success"
        });

      } catch (eventError) {
        console.error("Error processing individual event:", eventError);
        results.push({
          email: event.email,
          event: event.event,
          status: "error",
          error: eventError instanceof Error ? eventError.message : "Unknown error"
        });
      }
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        message: `Processed ${results.length} MailJet events`,
        results: results,
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