import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0];

    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    const { data: pageMetadata } = await supabase
      .from("page_metadata")
      .select("slug, last_modified, change_frequency, priority");

    const metadataMap = new Map();
    if (pageMetadata) {
      pageMetadata.forEach((page) => {
        metadataMap.set(page.slug, {
          lastmod: new Date(page.last_modified).toISOString().split("T")[0],
          changefreq: page.change_frequency,
          priority: page.priority,
        });
      });
    }

    const getMetadata = (slug: string) => {
      return metadataMap.get(slug) || {
        lastmod: today,
        changefreq: "monthly",
        priority: 0.5,
      };
    };

    const homeMeta = getMetadata("/");
    const blogMeta = getMetadata("/blog");

    let blogPostsXml = "";
    if (blogPosts) {
      blogPostsXml = blogPosts.map((post) => {
        const lastmod = post.updated_at
          ? new Date(post.updated_at).toISOString().split("T")[0]
          : new Date(post.created_at).toISOString().split("T")[0];
        return `  <url>
    <loc>https://powerwashjm.com/blog/${post.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }).join("\n");
    }

    let staticPagesXml = "";
    if (pageMetadata) {
      staticPagesXml = pageMetadata
        .filter((page) => page.slug !== "/" && page.slug !== "/blog")
        .map((page) => {
          const meta = getMetadata(page.slug);
          return `  <url>
    <loc>https://powerwashjm.com${page.slug.endsWith('/') ? page.slug : page.slug + '/'}</loc>
    <lastmod>${meta.lastmod}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
        }).join("\n");
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>https://powerwashjm.com/</loc>
    <lastmod>${homeMeta.lastmod}</lastmod>
    <changefreq>${homeMeta.changefreq}</changefreq>
    <priority>${homeMeta.priority}</priority>
  </url>

  <!-- Blog Pages -->
  <url>
    <loc>https://powerwashjm.com/blog/</loc>
    <lastmod>${blogMeta.lastmod}</lastmod>
    <changefreq>${blogMeta.changefreq}</changefreq>
    <priority>${blogMeta.priority}</priority>
  </url>

  <!-- Blog Posts -->
${blogPostsXml}

  <!-- All Static Pages -->
${staticPagesXml}

</urlset>
`;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sitemap generated successfully",
        blogPostCount: blogPosts?.length || 0,
        staticPageCount: pageMetadata?.length || 0,
        lastUpdated: today,
        xml: xml,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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