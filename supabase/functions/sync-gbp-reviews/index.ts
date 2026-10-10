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

    const reviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${settings.account_id}/locations/${settings.location_id}/reviews`;
    const reviewsResponse = await fetch(reviewsUrl, {
      headers: {
        'Authorization': `Bearer ${settings.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!reviewsResponse.ok) {
      const errorData = await reviewsResponse.json();
      console.error('Reviews fetch error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch reviews from Google' }),
        { status: reviewsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviewsData = await reviewsResponse.json();
    const reviews = reviewsData.reviews || [];

    let syncedCount = 0;
    for (const review of reviews) {
      const reviewData = {
        gbp_review_id: review.reviewId,
        reviewer_name: review.reviewer?.displayName || 'Anonymous',
        reviewer_profile_url: review.reviewer?.profilePhotoUrl || null,
        star_rating: review.starRating === 'FIVE' ? 5 : review.starRating === 'FOUR' ? 4 : review.starRating === 'THREE' ? 3 : review.starRating === 'TWO' ? 2 : 1,
        review_text: review.comment || null,
        review_reply: review.reviewReply?.comment || null,
        reply_posted_at: review.reviewReply?.updateTime || null,
        review_created_at: review.createTime,
        last_synced_at: new Date().toISOString(),
        is_responded: !!review.reviewReply,
      };

      const { error: upsertError } = await supabase
        .from('google_business_reviews')
        .upsert(reviewData, { onConflict: 'gbp_review_id' });

      if (!upsertError) {
        syncedCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: syncedCount, message: `Synced ${syncedCount} reviews` }),
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