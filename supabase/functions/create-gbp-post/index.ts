import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

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
    // Google deprecated the My Business Local Posts API (v4) in 2021
    // This endpoint no longer works and is kept only for backwards compatibility
    // Returning a clear error message to inform users

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Google My Business Local Posts API Deprecated',
        message: 'Google deprecated the Local Posts API in 2021. Text posts can no longer be created programmatically through the API. Please create posts manually at https://business.google.com/',
        deprecated: true,
        alternativeUrl: 'https://business.google.com/'
      }),
      {
        status: 410, // 410 Gone - indicates the resource is no longer available
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in deprecated create-gbp-post function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API Deprecated',
        message: 'This API endpoint is no longer functional. Google deprecated the Local Posts API in 2021.'
      }),
      { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});