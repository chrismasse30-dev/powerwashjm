import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const INDEXNOW_KEY = "c8adb0c6f37dd197bd5655b378753823";
const SITE_HOST = "powerwashjm.com";
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "urls array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullUrls = urls.map((url: string) =>
      url.startsWith("http") ? url : `https://${SITE_HOST}${url.startsWith("/") ? url : "/" + url}`
    );

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: fullUrls,
    };

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const statusCode = response.status;
    let responseText = "";
    try {
      responseText = await response.text();
    } catch {
      responseText = "";
    }

    const result = {
      success: statusCode >= 200 && statusCode < 300,
      statusCode,
      message: getStatusMessage(statusCode),
      urlsSubmitted: fullUrls.length,
      urls: fullUrls,
      responseBody: responseText || undefined,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getStatusMessage(status: number): string {
  switch (status) {
    case 200: return "OK - URLs submitted successfully";
    case 202: return "Accepted - URLs accepted for processing";
    case 400: return "Bad Request - Invalid format";
    case 403: return "Forbidden - Key not valid or not matching";
    case 422: return "Unprocessable - URLs don't belong to the host";
    case 429: return "Too Many Requests - Rate limited";
    default: return `Response status: ${status}`;
  }
}
