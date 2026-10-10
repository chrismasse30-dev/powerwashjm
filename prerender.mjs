import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes to prerender
const routes = [
  '/',
  '/house-washing',
  '/holiday-lights',
  '/roof-cleaning',
  '/deck-cleaning',
  '/concrete-cleaning',
  '/gutter-cleaning',
  '/commercial',
  '/financing',
  '/faq',
  '/customer-portal',
  '/privacy-policy',
  '/towns',
  // Add key town pages
  '/towns/providence-ri',
  '/towns/warwick-ri',
  '/towns/cranston-ri',
  '/towns/pawtucket-ri',
  '/towns/woonsocket-ri',
  '/towns/smithfield-ri',
  '/towns/north-smithfield-ri',
  '/towns/cumberland-ri',
  '/towns/lincoln-ri',
  '/towns/attleboro-ma',
  '/towns/franklin-ma',
  '/towns/mansfield-ma',
];

// Read the base HTML template
const templatePath = path.resolve(__dirname, 'dist/index.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// Create directory structure and write files
routes.forEach(route => {
  const routePath = route === '/' ? '/index' : route;
  const filePath = path.resolve(__dirname, 'dist', routePath.slice(1), 'index.html');
  const dirPath = path.dirname(filePath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // For now, just copy the template - a full SSR solution would render React here
  // This at least creates proper URLs for crawlers
  let html = template;

  // Add route-specific meta tags for better SEO
  if (route !== '/') {
    const routeName = route.split('/').filter(Boolean).pop().replace(/-/g, ' ');
    const capitalizedName = routeName.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    html = html.replace(
      '<meta property="og:url" content="https://www.powerwashjm.pro/" />',
      `<meta property="og:url" content="https://powerwashjm.com${route}/" />`
    );

    html = html.replace(
      '<link rel="canonical" href="https://www.powerwashjm.pro/" />',
      `<link rel="canonical" href="https://powerwashjm.com${route}/" />`
    );
  }

  // Write the file
  if (route === '/') {
    // Don't overwrite the root index.html
    console.log(`Skipping root: ${route}`);
  } else {
    fs.writeFileSync(filePath, html);
    console.log(`Pre-rendered: ${route}`);
  }
});

console.log('\nPre-rendering complete!');
console.log(`Generated ${routes.length - 1} static pages for better SEO.`);
