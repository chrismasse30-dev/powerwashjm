import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { reviewId, reply } = await req.json();

    if (!reviewId || !reply) {
      return new Response(
        JSON.stringify({ success: false, error: 'Review ID and reply are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: settings, error: settingsError } = await supabase
      .from('google_business_settings')
      .select('*')
      .maybeSingle();

    if (settingsError || !settings || !settings.access_token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Google Business Profile not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!settings.account_id || !settings.location_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Account ID and Location ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const replyUrl = `https://mybusiness.googleapis.com/v4/accounts/${settings.account_id}/locations/${settings.location_id}/reviews/${reviewId}/reply`;
    const replyResponse = await fetch(replyUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${settings.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: reply,
      }),
    });

    if (!replyResponse.ok) {
      const errorData = await replyResponse.json();
      console.error('Reply error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to post reply to Google' }),
        { status: replyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateError } = await supabase
      .from('google_business_reviews')
      .update({
        review_reply: reply,
        reply_posted_at: new Date().toISOString(),
        is_responded: true,
      })
      .eq('gbp_review_id', reviewId);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Reply posted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});