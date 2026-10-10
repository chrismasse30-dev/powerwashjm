import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSitemap() {
  console.log('🗺️  Generating updated sitemap...\n');

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch published blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, title, updated_at, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  console.log(`✅ Found ${blogPosts?.length || 0} published blog posts`);

  // Fetch page metadata from database
  const { data: pageMetadata } = await supabase
    .from('page_metadata')
    .select('*')
    .order('slug');

  console.log(`✅ Found ${pageMetadata?.length || 0} tracked pages\n`);

  // Create a map for easy lookup
  const metadataMap = {};
  pageMetadata?.forEach(page => {
    metadataMap[page.slug] = page;
  });

  // Helper function to get page data or defaults
  const getPageData = (slug) => {
    const meta = metadataMap[slug];
    if (meta) {
      return {
        lastmod: new Date(meta.last_modified).toISOString().split('T')[0],
        changefreq: meta.change_frequency,
        priority: meta.priority
      };
    }
    return { lastmod: today, changefreq: 'monthly', priority: 0.5 };
  };

  // Generate XML for static pages
  const staticPagesXml = pageMetadata
    ?.map(page => {
      const lastmod = new Date(page.last_modified).toISOString().split('T')[0];
      return `  <url>
    <loc>https://powerwashjm.com${page.slug === '/' ? '/' : (page.slug.endsWith('/') ? page.slug : page.slug + '/')}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.change_frequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    })
    .join('\n') || '';

  // Generate XML for blog posts
  const blogPostsXml = blogPosts
    ?.map(post => {
      const lastmod = post.updated_at
        ? new Date(post.updated_at).toISOString().split('T')[0]
        : new Date(post.created_at).toISOString().split('T')[0];
      return `  <url>
    <loc>https://powerwashjm.com/blog/${post.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('\n') || '';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static Pages -->
${staticPagesXml}

  <!-- Blog Posts -->
${blogPostsXml}

</urlset>
`;

  writeFileSync('public/sitemap.xml', xml);
  console.log('✅ Sitemap generated successfully!\n');
  console.log('📝 Summary:');
  console.log(`   - Static pages: ${pageMetadata?.length || 0} pages`);
  console.log(`   - Blog posts: ${blogPosts?.length || 0} pages`);
  console.log(`   - Total: ${(pageMetadata?.length || 0) + (blogPosts?.length || 0)} URLs`);
  console.log(`\n📅 Last modified dates loaded from database`);
  console.log(`\n✓ Sitemap saved to public/sitemap.xml\n`);
}

generateSitemap().catch(console.error);
