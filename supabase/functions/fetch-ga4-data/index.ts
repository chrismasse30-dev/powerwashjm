import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GA4_PROPERTY_ID = "507877200";

const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "hip-rain-474513-i8",
  private_key_id: "7b14033df4c4ad37522f9454818bad99462635c3",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDEcGWiazs3dxK2
3XTtSq9EewGrO+IqRsRgPnWYJpZRGmg3WDrtN+LkoUWOJmt9hBv+FdnHOlHJBjWc
Q72KeIuKd6XDvZpDCxKYEf+izC/qNNjkLPMiuSQLCT6havd+jHKESjlaJKKTFG3C
XrUzEdF2lJDN1myalRo9h5XhhLGyq5JomTdXnwzlqqIJuTwN1zFc/3XwNESvopQO
0Sd4NKZOyYZulPlu4oEg6D6i+z8X4jSRbNq695ysBDtpZGeTwcWQtGs6OIWOyhvt
bYQ6+vA3/XxKZjn6sPjp6DFaKpkxDNfkDQ3S7R89KkE8Aj1WoX8CssSd+Zz2Sl24
l34wEMp3AgMBAAECggEAAjR/dObz6jfO9k3ewyR5z9tQSyYdRXuNNsYHYebaUcdp
xhKaeWaNiHglpLvaVwqwRGuQX0PQqTYFognB9ez2fAkYdkMJmUO6417IWivP7zbF
Ude4qaTJunSnHFQWunfvInxcJR6Q00qBFOklQDvXTcJ11v8CMcCyDmDC654mtH+4
JbsmxJPjmup358aQdwaYzQRlGkqRKOUk6TaxDBriale0GXyy6MVhl7tL2wTN8d4P
Ia+eX9rSgrLqg56VPJatcnLsIaKsk/m99TdFf/sfkr8w+u7JI8Vt1nKOSnmx0PNe
oykxjI/id0M76Im9PeJPvKEOsrP5VH4Fdy/cQEraoQKBgQD60/X2vquJ+/hM8brX
eETQrUCZVK1fnImnnK81oG5KtnpaFol3nx02VeOoKgmrWMF0rsJOHrAe3mBF20ql
vuYWfdKU1NDFRmtbv3Kt2fFNscjYf+/x9BB0ugT9GbfrI/IsiNApIIl7QyBCswCC
Yy87nWMzx/2kv3Ha0pX7YS9ipwKBgQDIfVW12KK3LaTSvzXe3oLHXClNlFWOYcB8
vAsedJ+M7fzlLETnBv++KxmcR0zgpjAPqZFbfvrsg0Fn2vih/UEM/EArzlUAbwA9
ASBJW5na8Vm8r7+uQVq1LgK6y2ocXpVrQj3sFuvsp3B5VjUxR9BZzalZAoY5Pa7i
ShyeA4FjsQKBgCj+cWmlWfXQR5GTxFyo3F5aon8s1rUUqW7KbdxO3xe44SBOJKN3
Ttfti6qVTEVD2UJPuZP48gHpiESChZ23KHWulLccXQ6Q5sT08jI1t3liQBgaOMYL
hJD/Qgd3p5Z3poHezl6aYb3Sh7g+9ytYOIT+wRLacbr2Sw5fcoHGLW9rAoGAHLg3
ivEZffv/3GCfqulc+ontMLvK9bZzCGs3fIlgQaPl0j5hMGcEQ42RAZ4FGTk1MUkt
FVo/P5odyG7JpwrMQrvvxVatPn6oHhUHNvr0MzTXkfvrDV83SzToFzIEZUP3S4IV
tLgj26awqfD7da+/3N1lIOcHqzN21duf9dKyukECgYA3uPUpn28G710wPlyJzS4s
VOwEX1R0jBWnsBGRyt3LUGC0WdBJCyNFc2xpMODoyWJDMlZLBzDKAbHGyvDYNrNl
aYERGOPocik04vuf6SOPh/r4zBdzLkiJ8ANGJxaFiHO+Hv84JqixV8qsxKGTCI5a
0XIvJH2kX3fGq/oMLPnDlw==
-----END PRIVATE KEY-----`,
  client_email: "google-analytics@hip-rain-474513-i8.iam.gserviceaccount.com",
  client_id: "100999967180754320787",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/google-analytics%40hip-rain-474513-i8.iam.gserviceaccount.com"
};

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function createJWT(): Promise<string> {
  try {
    const header = {
      alg: "RS256",
      typ: "JWT"
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: SERVICE_ACCOUNT.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: SERVICE_ACCOUNT.token_uri,
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = SERVICE_ACCOUNT.private_key
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\s/g, "");

    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(signatureInput)
    );

    const encodedSignature = arrayBufferToBase64Url(signature);
    return `${signatureInput}.${encodedSignature}`;
  } catch (error) {
    console.error('JWT creation error:', error);
    throw new Error(`Failed to create JWT: ${error.message}`);
  }
}

async function getAccessToken(): Promise<string> {
  try {
    const jwt = await createJWT();

    const response = await fetch(SERVICE_ACCOUNT.token_uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token fetch error:', errorText);
      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Access token error:', error);
    throw error;
  }
}

async function fetchGA4Data(accessToken: string, reportType: string, startDate: string, endDate: string) {
  const reports: Record<string, any> = {
    kpis: {
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "totalUsers" },
        { name: "eventCount" },
        { name: "keyEvents" }
      ],
      dateRanges: [{ startDate, endDate }]
    },
    trend: {
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      dateRanges: [{ startDate, endDate }],
      orderBys: [{ dimension: { dimensionName: "date" } }]
    },
    pages: {
      dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" }
      ],
      dateRanges: [{ startDate, endDate }],
      limit: 10,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }]
    },
    geo: {
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      dateRanges: [{ startDate, endDate }],
      limit: 10,
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }]
    },
    traffic: {
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      dateRanges: [{ startDate, endDate }],
      limit: 10,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }]
    },
    realtime: {
      dimensions: [{ name: "minutesAgo" }],
      metrics: [{ name: "activeUsers" }],
      limit: 30
    }
  };

  const requestBody = reports[reportType];
  if (!requestBody) {
    throw new Error(`Unknown report type: ${reportType}`);
  }

  const url = reportType === 'realtime'
    ? `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runRealtimeReport`
    : `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`;

  console.log('Making GA4 request:', { url, reportType, requestBody: JSON.stringify(requestBody) });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GA4 API error:', errorText);
    throw new Error(`GA4 API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const reportType = url.searchParams.get('type') || 'kpis';
    const startDate = url.searchParams.get('startDate') || '7daysAgo';
    const endDate = url.searchParams.get('endDate') || 'today';

    console.log('Request params:', { reportType, startDate, endDate });

    const accessToken = await getAccessToken();
    console.log('Got access token successfully');

    const data = await fetchGA4Data(accessToken, reportType, startDate, endDate);
    console.log('Got GA4 data successfully');

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        details: 'Check edge function logs for more information'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});