import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Fetching location for IP:', clientIp);

    const response = await fetch(`https://ipapi.co/${clientIp}/json/`, {
      headers: {
        'User-Agent': 'JM-PowerWashing-EdgeFunction/1.0'
      }
    });

    if (!response.ok) {
      console.error('ipapi.co returned status:', response.status);
      return new Response(
        JSON.stringify({ city: '', state: '', ip: clientIp, error: 'API unavailable' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();

    if (data.error) {
      console.warn('ipapi.co error:', data.reason);
      return new Response(
        JSON.stringify({ city: '', state: '', ip: clientIp, error: data.reason }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = {
      city: data.city || '',
      state: data.region || '',
      ip: clientIp
    };

    console.log('Returning location data:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in get-ip-location function:', error);
    return new Response(
      JSON.stringify({ 
        city: '', 
        state: '', 
        ip: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});