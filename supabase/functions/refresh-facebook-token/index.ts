import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TokenRefreshRequest {
  shortLivedToken: string;
}

interface FacebookTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
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

    const { shortLivedToken }: TokenRefreshRequest = await req.json();

    if (!shortLivedToken) {
      throw new Error('Short-lived token is required');
    }

    console.log('Refreshing Facebook token...');

    // Get Facebook settings
    const { data: settings, error: settingsError } = await supabase
      .from('facebook_settings')
      .select('facebook_app_id, facebook_app_secret')
      .maybeSingle();

    if (settingsError || !settings) {
      throw new Error('Facebook settings not found');
    }

    if (!settings.facebook_app_secret) {
      throw new Error('Facebook App Secret not configured');
    }

    // Step 1: Exchange short-lived token for long-lived token (60 days)
    const tokenExchangeUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    tokenExchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
    tokenExchangeUrl.searchParams.set('client_id', settings.facebook_app_id);
    tokenExchangeUrl.searchParams.set('client_secret', settings.facebook_app_secret);
    tokenExchangeUrl.searchParams.set('fb_exchange_token', shortLivedToken);

    const tokenResponse = await fetch(tokenExchangeUrl.toString());
    const tokenData: FacebookTokenResponse = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      const errorMessage = tokenData.error?.message || 'Failed to exchange token';
      console.error('Token exchange error:', tokenData.error);
      throw new Error(`Token exchange failed: ${errorMessage}`);
    }

    const longLivedUserToken = tokenData.access_token!;
    const expiresIn = tokenData.expires_in || 5184000; // Default 60 days in seconds

    console.log('Successfully obtained long-lived user token');

    // Step 2: Get Page Access Token (never expires as long as app is used)
    const accountsUrl = new URL('https://graph.facebook.com/v19.0/me/accounts');
    accountsUrl.searchParams.set('access_token', longLivedUserToken);

    const accountsResponse = await fetch(accountsUrl.toString());
    const accountsData = await accountsResponse.json();

    if (!accountsResponse.ok || accountsData.error) {
      const errorMessage = accountsData.error?.message || 'Failed to get page access token';
      console.error('Page accounts error:', accountsData.error);
      throw new Error(`Failed to get page token: ${errorMessage}`);
    }

    if (!accountsData.data || accountsData.data.length === 0) {
      throw new Error('No pages found for this user');
    }

    // Find the specific page or use the first one
    const { data: pageSettings } = await supabase
      .from('facebook_settings')
      .select('facebook_page_id')
      .maybeSingle();

    const targetPageId = pageSettings?.facebook_page_id;
    const page = targetPageId
      ? accountsData.data.find((p: any) => p.id === targetPageId)
      : accountsData.data[0];

    if (!page) {
      throw new Error(`Page with ID ${targetPageId} not found`);
    }

    const pageAccessToken = page.access_token;
    console.log('Successfully obtained page access token for page:', page.name);

    // Calculate expiration date (60 days from now)
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

    // Update database with new token
    const { error: updateError } = await supabase
      .from('facebook_settings')
      .update({
        page_access_token: pageAccessToken,
        token_expires_at: expirationDate.toISOString(),
        last_token_refresh: new Date().toISOString(),
      })
      .eq('id', settings.id || (await supabase.from('facebook_settings').select('id').single()).data?.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
      throw new Error('Failed to save token to database');
    }

    console.log('Token successfully saved to database');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token refreshed successfully',
        pageName: page.name,
        pageId: page.id,
        expiresAt: expirationDate.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refresh-facebook-token function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
