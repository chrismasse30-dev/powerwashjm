#!/usr/bin/env node

/**
 * SEO Verification Script
 * Tests that HTML content is visible to search engines without JavaScript
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testRoutes = [
  { path: '/index.html', name: 'Homepage' },
  { path: '/house-washing/index.html', name: 'House Washing' },
  { path: '/holiday-lights/index.html', name: 'Holiday Lights' },
  { path: '/roof-cleaning/index.html', name: 'Roof Cleaning' },
  { path: '/towns/providence-ri/index.html', name: 'Providence RI' }
];

console.log('🔍 SEO Verification Test\n');
console.log('Testing HTML content visibility without JavaScript...\n');
console.log('─'.repeat(60));

let allTestsPassed = true;

testRoutes.forEach(route => {
  const filePath = path.join(__dirname, 'dist', route.path);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${route.name}: File not found`);
    allTestsPassed = false;
    return;
  }

  const html = fs.readFileSync(filePath, 'utf-8');

  // Test 1: Check for content in root div
  const hasContent = html.includes('<div id="root">') &&
                     !html.includes('<div id="root"></div>');

  // Test 2: Check for semantic HTML
  const hasHeader = html.includes('<header>');
  const hasMain = html.includes('<main>');
  const hasHeadings = html.includes('<h1>') || html.includes('<h2>');

  // Test 3: Check for meta tags
  const hasTitle = html.match(/<title>.*<\/title>/);
  const hasDescription = html.includes('<meta name="description"');
  const hasCanonical = html.includes('<link rel="canonical"');
  const hasOgTags = html.includes('<meta property="og:title"');

  // Results
  console.log(`\n📄 ${route.name}`);
  console.log(`   File: ${route.path}`);
  console.log(`   Content in DOM: ${hasContent ? '✅' : '❌'}`);
  console.log(`   Semantic HTML: ${hasHeader && hasMain ? '✅' : '❌'}`);
  console.log(`   H1/H2 Tags: ${hasHeadings ? '✅' : '❌'}`);
  console.log(`   Title Tag: ${hasTitle ? '✅' : '❌'}`);
  console.log(`   Meta Description: ${hasDescription ? '✅' : '❌'}`);
  console.log(`   Canonical URL: ${hasCanonical ? '✅' : '❌'}`);
  console.log(`   Open Graph Tags: ${hasOgTags ? '✅' : '❌'}`);

  if (hasTitle) {
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log(`   Title: "${titleMatch[1]}"`);
  }

  // Extract first H1 content
  const h1Match = html.match(/<h1>(.*?)<\/h1>/);
  if (h1Match) {
    console.log(`   H1: "${h1Match[1]}"`);
  }

  const allPassed = hasContent && hasHeader && hasMain && hasHeadings &&
                    hasTitle && hasDescription && hasCanonical && hasOgTags;

  if (!allPassed) {
    allTestsPassed = false;
  }
});

console.log('\n' + '─'.repeat(60));

if (allTestsPassed) {
  console.log('\n✅ All SEO tests passed!');
  console.log('\n🎉 Your website is now search engine friendly!');
  console.log('\nSearch engines will see:');
  console.log('  • Full HTML content without JavaScript');
  console.log('  • Proper meta tags and titles');
  console.log('  • Semantic HTML structure (header, main, h1-h3)');
  console.log('  • Crawlable content for indexing');
  console.log('  • Correct canonical URLs');
  console.log('\nNext steps:');
  console.log('  1. Deploy to production');
  console.log('  2. Submit sitemap to Google Search Console');
  console.log('  3. Request re-indexing of updated pages');
  console.log('  4. Monitor crawl stats and indexing status\n');
  process.exit(0);
} else {
  console.log('\n❌ Some SEO tests failed');
  console.log('\nPlease run: npm run build\n');
  process.exit(1);
}
