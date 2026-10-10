import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface FacebookPostRequest {
  blogPostId: string;
  blogPostTitle: string;
  blogPostSlug: string;
  forcePost?: boolean;
}

interface FacebookSettings {
  facebook_page_id: string;
  page_access_token: string;
  is_enabled: boolean;
}

interface FacebookAPIResponse {
  id?: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { blogPostId, blogPostTitle, blogPostSlug, forcePost = false }: FacebookPostRequest = await req.json();

    if (!blogPostId || !blogPostTitle || !blogPostSlug) {
      throw new Error('Missing required fields: blogPostId, blogPostTitle, or blogPostSlug');
    }

    console.log(`Processing Facebook post for blog: ${blogPostTitle}`);

    // Get blog post details including featured image
    const { data: blogPost, error: blogError } = await supabase
      .from('blog_posts')
      .select('featured_image_url, excerpt')
      .eq('id', blogPostId)
      .single();

    if (blogError || !blogPost) {
      throw new Error('Blog post not found');
    }

    // Check if already posted (unless force post)
    if (!forcePost) {
      const { data: existingLog } = await supabase
        .from('facebook_post_logs')
        .select('id, status, facebook_post_id')
        .eq('blog_post_id', blogPostId)
        .eq('status', 'success')
        .maybeSingle();

      if (existingLog?.facebook_post_id) {
        console.log('Blog post already posted to Facebook:', existingLog.facebook_post_id);
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Already posted to Facebook',
            facebookPostId: existingLog.facebook_post_id,
            skipped: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get Facebook settings
    const { data: settings, error: settingsError } = await supabase
      .from('facebook_settings')
      .select('facebook_page_id, page_access_token, is_enabled')
      .maybeSingle();

    if (settingsError || !settings) {
      throw new Error('Facebook settings not configured');
    }

    if (!settings.is_enabled && !forcePost) {
      throw new Error('Facebook integration is disabled');
    }

    if (!settings.page_access_token) {
      throw new Error('Facebook page access token not configured');
    }

    const fbSettings = settings as FacebookSettings;

    // Construct blog post URL
    const baseUrl = Deno.env.get('SITE_URL') || 'https://powerwashjm.com';
    const blogPostUrl = `${baseUrl}/blog/${blogPostSlug}`;

    // Create log entry
    const { data: logEntry, error: logError } = await supabase
      .from('facebook_post_logs')
      .insert({
        blog_post_id: blogPostId,
        blog_post_title: blogPostTitle,
        blog_post_url: blogPostUrl,
        status: 'pending',
        attempt_count: 1,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating log entry:', logError);
      throw new Error(`Failed to create log entry: ${logError.message || JSON.stringify(logError)}`);
    }

    console.log('Posting to Facebook Page:', fbSettings.facebook_page_id);

    // Prepare the post message with excerpt
    const postMessage = `📝 New Blog Post: ${blogPostTitle}\n\n${blogPost.excerpt}\n\nRead more at: ${blogPostUrl}`;

    let facebookResponse;
    let facebookData: FacebookAPIResponse;

    // If there's a featured image, post as photo with link
    if (blogPost.featured_image_url) {
      console.log('Posting with image:', blogPost.featured_image_url);

      const photoApiUrl = `https://graph.facebook.com/v19.0/${fbSettings.facebook_page_id}/photos`;
      const photoData = new URLSearchParams({
        url: blogPost.featured_image_url,
        message: postMessage,
        access_token: fbSettings.page_access_token,
      });

      facebookResponse = await fetch(photoApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: photoData.toString(),
      });

      facebookData = await facebookResponse.json();
    } else {
      // Fall back to link post if no image
      console.log('Posting as link (no featured image)');

      const feedApiUrl = `https://graph.facebook.com/v19.0/${fbSettings.facebook_page_id}/feed`;
      const feedData = new URLSearchParams({
        message: postMessage,
        link: blogPostUrl,
        access_token: fbSettings.page_access_token,
      });

      facebookResponse = await fetch(feedApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: feedData.toString(),
      });

      facebookData = await facebookResponse.json();
    }

    if (!facebookResponse.ok || facebookData.error) {
      const errorMessage = facebookData.error?.message || 'Unknown Facebook API error';
      console.error('Facebook API error:', facebookData.error);

      // Update log entry with error
      await supabase
        .from('facebook_post_logs')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', logEntry.id);

      throw new Error(`Facebook API error: ${errorMessage}`);
    }

    const facebookPostId = facebookData.id;
    console.log('Successfully posted to Facebook:', facebookPostId);

    // Update log entry with success
    await supabase
      .from('facebook_post_logs')
      .update({
        status: 'success',
        facebook_post_id: facebookPostId,
        posted_at: new Date().toISOString(),
      })
      .eq('id', logEntry.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully posted to Facebook',
        facebookPostId,
        logId: logEntry.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in post-to-facebook function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});