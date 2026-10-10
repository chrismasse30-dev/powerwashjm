import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GA4Event {
  name: string;
  params?: Record<string, any>;
}

interface GA4Payload {
  events: GA4Event[];
  client_id?: string;
  user_id?: string;
  session_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: GA4Payload = await req.json();

    const measurementId = Deno.env.get('GA4_MEASUREMENT_ID') || 'G-Q0CP5BKGSR';
    const apiSecret = Deno.env.get('GA4_API_SECRET');

    if (!apiSecret) {
      console.warn('GA4_API_SECRET not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'GA4 not configured'
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

    const clientId = payload.client_id || `${Date.now()}.${Math.random().toString(36).substring(2, 11)}`;
    const sessionId = payload.session_id || Date.now().toString();

    const ga4Payload: any = {
      client_id: clientId,
      events: payload.events.map(event => ({
        name: event.name,
        params: {
          ...event.params,
          engagement_time_msec: '100',
          session_id: sessionId,
        }
      }))
    };

    if (payload.user_id) {
      ga4Payload.user_id = payload.user_id;
    }

    const ga4Url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    const response = await fetch(ga4Url, {
      method: 'POST',
      body: JSON.stringify(ga4Payload),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('GA4 API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send to GA4',
          status: response.status
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event sent to GA4',
        events_count: payload.events.length
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
    console.error('Error in send-ga4-event function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
