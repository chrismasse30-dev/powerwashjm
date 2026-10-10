/**
 * Schema Markup Generator for Blog Posts
 * Automatically generates JSON-LD structured data for SEO
 */

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  featured_image_url: string;
  published_at: string;
  updated_at: string;
}

interface ArticleSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description?: string;
  image?: string | string[];
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
}

interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateArticleSchema(post: BlogPost): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.featured_image_url || undefined,
    author: {
      '@type': 'Person',
      name: post.author_name || 'J&M Power Washing'
    },
    publisher: {
      '@type': 'Organization',
      name: 'J&M Power Washing & Holiday Lights',
      logo: {
        '@type': 'ImageObject',
        url: 'https://powerwashjm.com/logos/logo.png'
      }
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://powerwashjm.com/blog/${post.slug}/`
    }
  };
}

export function detectAndGenerateFAQSchema(content: string): FAQSchema | null {
  const faqs: Array<{ question: string; answer: string }> = [];

  // Pattern 1: H3 questions followed by paragraphs
  const h3Pattern = /<h3>([^<]*\?[^<]*)<\/h3>\s*<p>([^<]+)<\/p>/gi;
  let match;

  while ((match = h3Pattern.exec(content)) !== null) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }

  // Pattern 2: H2 questions followed by paragraphs
  if (faqs.length < 2) {
    const h2Pattern = /<h2>([^<]*\?[^<]*)<\/h2>\s*<p>([^<]+)<\/p>/gi;

    while ((match = h2Pattern.exec(content)) !== null) {
      faqs.push({
        question: match[1].trim(),
        answer: match[2].trim()
      });
    }
  }

  if (faqs.length < 2) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateBreadcrumbSchema(post: BlogPost): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://powerwashjm.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://powerwashjm.com/blog/'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://powerwashjm.com/blog/${post.slug}/`
      }
    ]
  };
}

export function detectHowToSchema(content: string): any | null {
  // Detect step-by-step instructions
  const stepPatterns = [
    /<h3>Step \d+[:\s]+([^<]+)<\/h3>/gi,
    /<li><strong>Step \d+[:\s]+([^<]+)<\/strong>/gi,
    /<p><strong>\d+\.\s+([^<]+)<\/strong>/gi
  ];

  const steps: string[] = [];

  for (const pattern of stepPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      steps.push(match[1].trim());
    }

    if (steps.length >= 3) break;
  }

  if (steps.length < 3) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Guide',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step
    }))
  };
}

export function generateAllSchemas(post: BlogPost): any {
  const schemas: any[] = [];

  // Always include Article schema
  schemas.push(generateArticleSchema(post));

  // Add Breadcrumb schema
  schemas.push(generateBreadcrumbSchema(post));

  // Detect and add FAQ schema
  const faqSchema = detectAndGenerateFAQSchema(post.content);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  // Detect and add HowTo schema
  const howToSchema = detectHowToSchema(post.content);
  if (howToSchema) {
    schemas.push(howToSchema);
  }

  return schemas.length === 1 ? schemas[0] : schemas;
}

export function validateSchema(schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schema['@context']) {
    errors.push('Missing @context property');
  }

  if (!schema['@type']) {
    errors.push('Missing @type property');
  }

  if (schema['@type'] === 'Article') {
    if (!schema.headline) errors.push('Article missing headline');
    if (!schema.author) errors.push('Article missing author');
    if (!schema.datePublished) errors.push('Article missing datePublished');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function injectSchemaIntoHead(schema: any): void {
  const existingScript = document.getElementById('blog-schema-markup');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.id = 'blog-schema-markup';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}
