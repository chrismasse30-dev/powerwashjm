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
    const { imageUrl, category, description } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image URL is required' }),
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

    if (!settings.location_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Location ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!settings.account_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Account ID is required for photo uploads' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Posting photo to GBP:', {
      locationId: settings.location_id,
      accountId: settings.account_id,
      category,
      imageUrl
    });

    const createMediaUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${settings.location_id}/media`;

    const mediaPayload = {
      mediaFormat: 'PHOTO',
      sourceUrl: imageUrl,
      locationAssociation: {
        category: category || 'ADDITIONAL',
      },
    };

    console.log('API Request:', { url: createMediaUrl, payload: mediaPayload });

    const createMediaResponse = await fetch(createMediaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediaPayload),
    });

    if (!createMediaResponse.ok) {
      const errorData = await createMediaResponse.text();
      console.error('Create media error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create media item', details: errorData }),
        { status: createMediaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const createdMedia = await createMediaResponse.json();

    await supabase
      .from('google_business_post_logs')
      .insert({
        post_type: 'photo',
        source_title: description || 'Photo Upload',
        source_url: imageUrl,
        gbp_post_id: createdMedia.name || null,
        status: 'success',
        posted_at: new Date().toISOString(),
        post_content: JSON.stringify({ category, description }),
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Photo posted successfully',
        media: createdMedia
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error posting photo:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});