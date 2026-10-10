import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('📝 Pre-rendering blog posts...\n');

// Check for required environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Warning: Supabase credentials not found in environment variables.');
  console.warn('⚠️  Skipping blog post pre-rendering.');
  console.warn('⚠️  To enable blog pre-rendering, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.\n');
  process.exit(0);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the base HTML template
const templatePath = path.resolve(__dirname, 'dist/index.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// Fetch and pre-render blog posts
async function prerenderBlogPosts() {
  try {
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, featured_image_url')
      .eq('status', 'published');

    if (error) {
      console.error('❌ Error fetching blog posts:', error.message);
      console.warn('⚠️  Skipping blog post pre-rendering due to database error.\n');
      process.exit(0);
    }

    const posts = blogPosts || [];
    console.log(`Found ${posts.length} published blog posts\n`);

  posts.forEach(post => {
    const filePath = path.resolve(__dirname, 'dist/blog', post.slug, 'index.html');
    const dirPath = path.dirname(filePath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let html = template;

    // Update title
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${post.title} | J & M Power Washing and Holiday Lights</title>`
    );

    // Update meta description
    html = html.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${post.excerpt}" />`
    );

    // Update og:title
    html = html.replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${post.title}" />`
    );

    // Update og:description
    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${post.excerpt}" />`
    );

    // Update og:image with absolute URL
    html = html.replace(
      /<meta property="og:image" content=".*?" \/>/,
      `<meta property="og:image" content="${post.featured_image_url}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />`
    );

    // Update og:url
    html = html.replace(
      /<meta property="og:url" content="https:\/\/(www\.)?powerwashjm\.(com|pro)\/" \/>/,
      `<meta property="og:url" content="https://powerwashjm.com/blog/${post.slug}/" />`
    );

    // Update og:type to article
    html = html.replace(
      /<meta property="og:type" content="website" \/>/,
      `<meta property="og:type" content="article" />`
    );

    // Update canonical URL
    html = html.replace(
      /<link rel="canonical" href="https:\/\/(www\.)?powerwashjm\.(com|pro)\/" \/>/,
      `<link rel="canonical" href="https://powerwashjm.com/blog/${post.slug}/" />`
    );

    // Add twitter:image meta tag after twitter:card
    html = html.replace(
      /<meta name="twitter:card" content="summary_large_image" \/>/,
      `<meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${post.featured_image}" />`
    );

    // Add SEO content - replace whatever is inside <div id="root"> (may already have SSR content)
    const blogContent = `
    <article>
      <header>
        <h1>${post.title}</h1>
        <p>${post.excerpt}</p>
      </header>
      ${post.featured_image_url ? `<img src="${post.featured_image_url}" alt="${post.title}" width="1200" height="630" />` : ''}
    </article>
  `;

    const rootStart = html.indexOf('<div id="root">');
    if (rootStart !== -1) {
      const contentStart = rootStart + '<div id="root">'.length;
      let depth = 1;
      let i = contentStart;
      while (i < html.length && depth > 0) {
        if (html.startsWith('<div', i)) depth++;
        else if (html.startsWith('</div>', i)) depth--;
        if (depth > 0) i++;
      }
      html = html.substring(0, contentStart) + blogContent + html.substring(i);
    }

    // Inject BreadcrumbList JSON-LD
    const breadcrumbLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://powerwashjm.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://powerwashjm.com/blog/' },
        { '@type': 'ListItem', position: 3, name: post.title, item: `https://powerwashjm.com/blog/${post.slug}/` },
      ],
    });
    html = html.replace('</head>', `<script type="application/ld+json">${breadcrumbLd}</script>\n</head>`);

    fs.writeFileSync(filePath, html);
    console.log(`✅ Pre-rendered: /blog/${post.slug}`);
  });

    console.log(`\n🎉 Blog post pre-rendering complete!`);
  } catch (error) {
    console.error('❌ Error during blog post pre-rendering:', error.message);
    console.warn('⚠️  Skipping blog post pre-rendering due to error.\n');
    process.exit(0);
  }
}

prerenderBlogPosts().catch((error) => {
  console.error('❌ Fatal error during blog post pre-rendering:', error.message);
  console.warn('⚠️  Build will continue without blog post pre-rendering.\n');
  process.exit(0);
});
