export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const SITE_BASE_URL = 'https://powerwashjm.com';

function ensureTrailingSlash(url: string): string {
  const base = 'https://powerwashjm.com';
  if (url === base || url === base + '/') return base + '/';
  return url.endsWith('/') ? url : url + '/';
}

export function getCanonicalUrl(path?: string): string {
  if (path) {
    const raw = `${SITE_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
    return ensureTrailingSlash(raw);
  }
  const currentPath = window.location.pathname;
  return ensureTrailingSlash(`${SITE_BASE_URL}${currentPath}`);
}

export function updatePageMeta(config: SEOConfig) {
  document.title = config.title;

  const canonicalUrl = ensureTrailingSlash(config.canonical || getCanonicalUrl());
  const fullImageUrl = config.ogImage?.startsWith('http')
    ? config.ogImage
    : `${SITE_BASE_URL}${config.ogImage || '/logos/logo.png'}`;

  const metaTags = [
    { name: 'description', content: config.description },
    { name: 'keywords', content: config.keywords || '' },
    { property: 'og:title', content: config.ogTitle || config.title },
    { property: 'og:description', content: config.ogDescription || config.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: fullImageUrl },
    { property: 'og:image:alt', content: config.imageAlt || config.ogTitle || config.title },
    { property: 'og:image:width', content: config.imageWidth ? String(config.imageWidth) : '1200' },
    { property: 'og:image:height', content: config.imageHeight ? String(config.imageHeight) : '630' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'J&M Power Washing & Holiday Lights' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: config.ogTitle || config.title },
    { name: 'twitter:description', content: config.ogDescription || config.description },
    { name: 'twitter:image', content: fullImageUrl },
    { name: 'twitter:image:alt', content: config.imageAlt || config.ogTitle || config.title },
    { name: 'robots', content: 'index, follow' },
  ];

  metaTags.forEach(({ name, property, content }) => {
    if (!content) return;

    const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
    let element = document.querySelector(selector);

    if (!element) {
      element = document.createElement('meta');
      if (name) element.setAttribute('name', name);
      if (property) element.setAttribute('property', property);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  });

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalUrl;
}

export function addStructuredData(data: any) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export const businessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'J&M Power Washing & Holiday Lights',
  alternateName: 'J and M Power Washing',
  description: 'Professional power washing and holiday light installation services in Rhode Island and Massachusetts. Family-owned business specializing in house washing, roof cleaning, deck cleaning, and Christmas light installation.',
  image: 'https://powerwashjm.com/logos/logo.png',
  logo: 'https://powerwashjm.com/logos/logo.png',
  '@id': 'https://powerwashjm.com/',
  url: 'https://powerwashjm.com/',
  telephone: '+1-401-595-0726',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '50 Truman St',
    addressLocality: 'Johnston',
    addressRegion: 'RI',
    postalCode: '02919',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.8233,
    longitude: -71.4753,
  },
  areaServed: [
    {
      '@type': 'State',
      name: 'Rhode Island',
    },
    {
      '@type': 'State',
      name: 'Massachusetts',
    },
    { '@type': 'City', name: 'Warwick', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Cranston', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Providence', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Pawtucket', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Woonsocket', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'North Smithfield', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Cumberland', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Lincoln', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Smithfield', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'East Providence', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Johnston', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'North Providence', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Coventry', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'West Warwick', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Bristol', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Barrington', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'East Greenwich', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Tiverton', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'North Kingstown', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Scituate', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Glocester', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'West Greenwich', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Foster', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Burrillville', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Central Falls', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
    { '@type': 'City', name: 'Attleboro', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Franklin', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Mansfield', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'North Attleboro', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Seekonk', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Rehoboth', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Norton', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Blackstone', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Millville', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Uxbridge', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Douglas', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Northbridge', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Grafton', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Sutton', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Millbury', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Shrewsbury', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Bellingham', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Wrentham', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Plainville', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Foxboro', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
    { '@type': 'City', name: 'Swansea', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '07:00',
    closes: '19:00',
  },

  hasMap: 'https://maps.google.com/?cid=4364751189816519423',
  sameAs: [
    'https://www.facebook.com/profile.php?id=100064067522225',
    'https://www.instagram.com/jmpowerwashing/',
    'https://maps.google.com/?cid=4364751189816519423',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Power Washing and Holiday Light Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'House Washing',
          description: 'Professional soft wash cleaning for vinyl and cedar siding',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Roof Cleaning',
          description: 'Safe roof cleaning to remove algae and stains',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Deck Cleaning',
          description: 'Deck restoration and staining services',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Concrete Cleaning',
          description: 'Driveway and concrete pressure washing',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Gutter Cleaning',
          description: 'Interior and exterior gutter cleaning',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Holiday Light Installation',
          description: 'Professional Christmas light design and installation',
        },
      },
    ],
  },
};

export function createServiceSchema(serviceName: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: serviceName,
    name: serviceName,
    description: description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'J&M Power Washing & Holiday Lights',
      telephone: '+1-401-595-0726',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '50 Truman St',
        addressLocality: 'Johnston',
        addressRegion: 'RI',
        postalCode: '02919',
        addressCountry: 'US',
      },

    },
    areaServed: businessStructuredData.areaServed,
    url: url,
  };
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface ImageSchemaConfig {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

export function createPrimaryImageSchema(config: ImageSchemaConfig) {
  const fullImageUrl = config.url.startsWith('http')
    ? config.url
    : `${SITE_BASE_URL}${config.url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: fullImageUrl,
    url: fullImageUrl,
    name: config.alt,
    description: config.alt,
    width: config.width || 1200,
    height: config.height || 630,
    caption: config.caption || config.alt,
    inLanguage: 'en-US',
  };
}

export function createWebPageWithImageSchema(config: {
  title: string;
  description: string;
  url: string;
  image: ImageSchemaConfig;
  datePublished?: string;
  dateModified?: string;
}) {
  const fullImageUrl = config.image.url.startsWith('http')
    ? config.image.url
    : `${SITE_BASE_URL}${config.image.url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.title,
    description: config.description,
    url: config.url,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      contentUrl: fullImageUrl,
      url: fullImageUrl,
      name: config.image.alt,
      description: config.image.alt,
      width: config.image.width || 1200,
      height: config.image.height || 630,
      caption: config.image.caption || config.image.alt,
      inLanguage: 'en-US',
    },
    datePublished: config.datePublished,
    dateModified: config.dateModified || config.datePublished,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'J&M Power Washing & Holiday Lights',
      url: SITE_BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'J&M Power Washing & Holiday Lights',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_BASE_URL}/logos/logo.png`,
        width: 512,
        height: 512,
      },
    },
  };
}

export function addMultipleStructuredData(dataArray: any[]) {
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => {
    if (!script.hasAttribute('data-static')) {
      script.remove();
    }
  });

  dataArray.forEach(data => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  });
}
