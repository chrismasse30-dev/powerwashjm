import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OptimizeRequest {
  imageUrl: string;
  width: number;
  height: number;
  quality?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageUrl, width, height, quality = 85 }: OptimizeRequest = await req.json();

    if (!imageUrl || !width || !height) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: imageUrl, width, height" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Use ImageMagick via wasm or native image processing
    // For Deno Deploy, we'll use theCanvas API
    const optimizedImage = await processImage(imageBuffer, width, height, quality);

    return new Response(optimizedImage, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Image optimization error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to optimize image",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processImage(
  buffer: ArrayBuffer,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  // Since Deno Deploy has limitations, we'll use a simple approach
  // that resizes and compresses using available APIs

  // Convert ArrayBuffer to Blob
  const blob = new Blob([buffer]);

  // For actual image processing, you would use sharp via npm:
  // import sharp from "npm:sharp@0.33.0";
  // const processed = await sharp(Buffer.from(buffer))
  //   .resize(width, height, { fit: 'cover', position: 'center' })
  //   .jpeg({ quality })
  //   .toBuffer();
  // return new Blob([processed], { type: 'image/jpeg' });

  // For now, return original with proper headers
  // In production, you'd deploy this with sharp support
  return blob;
}
