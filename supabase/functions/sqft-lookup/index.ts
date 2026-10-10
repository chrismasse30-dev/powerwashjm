import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  address: string;
}

interface LookupResult {
  sqft: number | null;
  source?: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { address }: RequestBody = await req.json();

    if (!address || address.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(`Looking up square footage for address: ${address}`);

    // Use OpenAI ChatGPT API to find square footage
    const result = await lookupSquareFootage(address);

    if (result.sqft) {
      console.log(`Found square footage: ${result.sqft} sq ft`);
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      console.log(`No square footage found for address: ${address}`);
      return new Response(
        JSON.stringify({ error: "Square footage not found", sqft: null }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in sqft-lookup function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        sqft: null,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function searchWeb(query: string): Promise<string> {
  try {
    // Use a web search API - DuckDuckGo Instant Answer API (free, no key required)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error("Search API error:", response.statusText);
      return "";
    }

    const data = await response.json();

    // Combine available text data
    let searchResults = "";
    if (data.AbstractText) searchResults += data.AbstractText + "\n";
    if (data.Abstract) searchResults += data.Abstract + "\n";

    // Try to get results from RelatedTopics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Text) searchResults += topic.Text + "\n";
      });
    }

    return searchResults || "No search results found";
  } catch (error) {
    console.error("Error searching web:", error);
    return "";
  }
}

async function lookupSquareFootage(address: string): Promise<LookupResult> {
  try {
    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured");
      return {
        sqft: null,
        error: "API key not configured. Please add OPENAI_API_KEY to your environment variables.",
      };
    }

    // First, try to search the web for property information
    console.log("Searching web for property data...");
    const searchQuery = `${address} square footage property size`;
    const searchResults = await searchWeb(searchQuery);
    console.log("Search results:", searchResults.substring(0, 200));

    // Build the prompt for ChatGPT with web search context
    const prompt = `You are a property data researcher. I need you to find the square footage for this residential property address:

${address}

${searchResults ? `Here is some web search data about this property:\n${searchResults}\n\n` : ''}

Your task is to find the OFFICIAL RECORDED total living area square footage for this property.

Look for information from these sources (in priority order):
1. County tax assessor or property appraiser records
2. Recent real estate listings (Zillow, Redfin, Realtor.com)
3. Public GIS or parcel data
4. Property sale records

IMPORTANT INSTRUCTIONS:
- Return ONLY the total living area square footage as a whole number
- Exclude basement, garage, and unfinished areas from the total
- Use this exact format: SQFT: [number]
- Example: SQFT: 2450
- If you cannot find reliable square footage data, respond with: SQFT: 0

Do not include any other text, explanations, or commentary. Just the SQFT: [number] format.`;

    // Call OpenAI ChatGPT API
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a precise property data extraction assistant. You provide only the requested information in the exact format specified, with no additional text or explanation."
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 150,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return {
        sqft: null,
        error: `API request failed: ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Extract the text response
    const textResponse = data?.choices?.[0]?.message?.content || "";
    console.log("ChatGPT response:", textResponse);

    // Extract square footage from response
    const sqftMatch = textResponse.match(/SQFT:\s*(\d+)/i);

    if (sqftMatch && sqftMatch[1]) {
      const sqft = parseInt(sqftMatch[1], 10);

      if (sqft > 0) {
        return {
          sqft,
          source: "Property data search via OpenAI",
        };
      }
    }

    // Try alternative extraction patterns if the exact format wasn't followed
    const numberMatch = textResponse.match(/(\d{3,5})\s*(?:sq|square)?[\s]?(?:ft|feet)?/i);
    if (numberMatch && numberMatch[1]) {
      const sqft = parseInt(numberMatch[1], 10);
      if (sqft > 100 && sqft < 50000) {
        console.log("Extracted sqft using alternative pattern:", sqft);
        return {
          sqft,
          source: "Property data search via OpenAI",
        };
      }
    }

    return {
      sqft: null,
      error: "Could not extract square footage from search results",
    };
  } catch (error) {
    console.error("Error in lookupSquareFootage:", error);
    return {
      sqft: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
