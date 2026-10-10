/**
 * Comprehensive SEO Analyzer
 * Real-time SEO Coach with 25+ checks
 */

import { analyzeReadability } from './readabilityAnalyzer';

export interface SEOCheck {
  id: string;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  impact: 'high' | 'medium' | 'low';
  category: 'content' | 'technical' | 'keywords' | 'images' | 'links';
}

export interface SEOAnalysis {
  score: number;
  checks: SEOCheck[];
  suggestions: string[];
  breakdown: {
    content: number;
    technical: number;
    keywords: number;
    images: number;
    links: number;
  };
}

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_description?: string;
  featured_image_url?: string;
  primary_keyword?: string;
  secondary_keywords?: string[];
}

export function analyzeSEO(post: BlogPostData): SEOAnalysis {
  const checks: SEOCheck[] = [];

  // CONTENT CHECKS
  checks.push(checkTitleLength(post.title));
  checks.push(checkTitleKeyword(post.title, post.primary_keyword));
  checks.push(checkExcerptLength(post.excerpt));
  checks.push(checkContentLength(post.content));
  checks.push(checkContentStructure(post.content));
  checks.push(checkKeywordInFirstParagraph(post.content, post.primary_keyword));
  checks.push(checkContentDepth(post.content));

  // TECHNICAL CHECKS
  checks.push(checkMetaDescription(post.meta_description, post.primary_keyword));
  checks.push(checkSlugOptimization(post.slug, post.primary_keyword));
  checks.push(checkHeadingHierarchy(post.content));
  checks.push(checkHTMLStructure(post.content));

  // KEYWORD CHECKS
  if (post.primary_keyword) {
    checks.push(checkKeywordDensity(post.content, post.primary_keyword));
    checks.push(checkKeywordInHeadings(post.content, post.primary_keyword));
  }

  // IMAGE CHECKS (Featured image is auto-applied by system, skip that check)
  checks.push(checkImageAltText(post.content));
  checks.push(checkImageCount(post.content));

  // LINK CHECKS (Links are auto-applied by system, skip those checks)

  // READABILITY CHECK
  const readabilityAnalysis = analyzeReadability(post.content);
  checks.push({
    id: 'readability',
    title: 'Readability Score',
    status: readabilityAnalysis.fleschScore >= 60 ? 'pass' : readabilityAnalysis.fleschScore >= 50 ? 'warning' : 'fail',
    message: `Flesch score: ${readabilityAnalysis.fleschScore} (${readabilityAnalysis.readingDifficulty})`,
    impact: 'medium',
    category: 'content'
  });

  const passedChecks = checks.filter(c => c.status === 'pass').length;
  const totalChecks = checks.length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  const breakdown = calculateBreakdown(checks);
  const suggestions = generateSuggestions(checks);

  return {
    score,
    checks,
    suggestions,
    breakdown
  };
}

function checkTitleLength(title: string): SEOCheck {
  const length = title.length;

  if (length >= 30 && length <= 60) {
    return {
      id: 'title_length',
      title: 'Title Length',
      status: 'pass',
      message: `Perfect! Title is ${length} characters (ideal: 30-60)`,
      impact: 'high',
      category: 'content'
    };
  } else if (length < 30) {
    return {
      id: 'title_length',
      title: 'Title Length',
      status: 'warning',
      message: `Title is only ${length} characters. Consider expanding to 30-60 characters.`,
      impact: 'high',
      category: 'content'
    };
  } else {
    return {
      id: 'title_length',
      title: 'Title Length',
      status: 'fail',
      message: `Title is ${length} characters. May be truncated in search results (limit: 60).`,
      impact: 'high',
      category: 'content'
    };
  }
}

function checkTitleKeyword(title: string, keyword?: string): SEOCheck {
  if (!keyword) {
    return {
      id: 'title_keyword',
      title: 'Primary Keyword in Title',
      status: 'warning',
      message: 'No primary keyword set. Add a target keyword for better optimization.',
      impact: 'high',
      category: 'keywords'
    };
  }

  const titleLower = title.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  if (titleLower.includes(keywordLower)) {
    const position = titleLower.indexOf(keywordLower);
    const isAtStart = position < 20;

    return {
      id: 'title_keyword',
      title: 'Primary Keyword in Title',
      status: 'pass',
      message: isAtStart ? 'Keyword appears near the beginning of title (optimal)' : 'Keyword found in title',
      impact: 'high',
      category: 'keywords'
    };
  }

  return {
    id: 'title_keyword',
    title: 'Primary Keyword in Title',
    status: 'fail',
    message: 'Primary keyword not found in title. Include your target keyword for better rankings.',
    impact: 'high',
    category: 'keywords'
  };
}

function checkExcerptLength(excerpt: string): SEOCheck {
  const length = excerpt?.length || 0;

  if (length >= 120 && length <= 160) {
    return {
      id: 'excerpt_length',
      title: 'Excerpt Length',
      status: 'pass',
      message: `Excerpt is ${length} characters (ideal: 120-160)`,
      impact: 'medium',
      category: 'content'
    };
  } else if (length < 120) {
    return {
      id: 'excerpt_length',
      title: 'Excerpt Length',
      status: 'warning',
      message: `Excerpt is ${length} characters. Expand to 120-160 for better preview snippets.`,
      impact: 'medium',
      category: 'content'
    };
  } else {
    return {
      id: 'excerpt_length',
      title: 'Excerpt Length',
      status: 'fail',
      message: `Excerpt is ${length} characters. May be truncated (limit: 160).`,
      impact: 'medium',
      category: 'content'
    };
  }
}

function checkContentLength(content: string): SEOCheck {
  const plainText = content.replace(/<[^>]*>/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 800) {
    return {
      id: 'content_length',
      title: 'Content Length',
      status: 'pass',
      message: `${wordCount} words. Excellent depth for SEO.`,
      impact: 'high',
      category: 'content'
    };
  } else if (wordCount >= 500) {
    return {
      id: 'content_length',
      title: 'Content Length',
      status: 'warning',
      message: `${wordCount} words. Consider expanding to 800+ words for better rankings.`,
      impact: 'high',
      category: 'content'
    };
  } else {
    return {
      id: 'content_length',
      title: 'Content Length',
      status: 'fail',
      message: `Only ${wordCount} words. Add more content (minimum: 500 words).`,
      impact: 'high',
      category: 'content'
    };
  }
}

function checkContentStructure(content: string): SEOCheck {
  const hasH2 = /<h2[^>]*>/i.test(content);
  const hasParagraphs = /<p[^>]*>/i.test(content);
  const hasLists = /<ul[^>]*>|<ol[^>]*>/i.test(content);

  if (hasH2 && hasParagraphs) {
    return {
      id: 'content_structure',
      title: 'Content Structure',
      status: 'pass',
      message: 'Good use of headings and paragraphs',
      impact: 'medium',
      category: 'content'
    };
  } else if (!hasH2) {
    return {
      id: 'content_structure',
      title: 'Content Structure',
      status: 'fail',
      message: 'No H2 headings found. Add subheadings to organize content.',
      impact: 'medium',
      category: 'content'
    };
  } else {
    return {
      id: 'content_structure',
      title: 'Content Structure',
      status: 'warning',
      message: 'Content structure needs improvement. Use proper HTML tags.',
      impact: 'medium',
      category: 'content'
    };
  }
}

function checkKeywordInFirstParagraph(content: string, keyword?: string): SEOCheck {
  if (!keyword) {
    return {
      id: 'keyword_first_paragraph',
      title: 'Keyword in Introduction',
      status: 'warning',
      message: 'Set a primary keyword to check placement',
      impact: 'medium',
      category: 'keywords'
    };
  }

  const firstParagraph = content.match(/<p[^>]*>(.*?)<\/p>/i)?.[1] || '';
  const plainText = firstParagraph.replace(/<[^>]*>/g, '').toLowerCase();

  if (plainText.includes(keyword.toLowerCase())) {
    return {
      id: 'keyword_first_paragraph',
      title: 'Keyword in Introduction',
      status: 'pass',
      message: 'Primary keyword appears in the first paragraph',
      impact: 'medium',
      category: 'keywords'
    };
  }

  return {
    id: 'keyword_first_paragraph',
    title: 'Keyword in Introduction',
    status: 'fail',
    message: 'Add your primary keyword to the first paragraph',
    impact: 'medium',
    category: 'keywords'
  };
}

function checkMetaDescription(metaDesc?: string, keyword?: string): SEOCheck {
  const length = metaDesc?.length || 0;

  if (length === 0) {
    return {
      id: 'meta_description',
      title: 'Meta Description',
      status: 'fail',
      message: 'Meta description is missing. Add one for better search snippets.',
      impact: 'high',
      category: 'technical'
    };
  }

  if (length >= 120 && length <= 160) {
    const hasKeyword = keyword ? metaDesc!.toLowerCase().includes(keyword.toLowerCase()) : false;

    return {
      id: 'meta_description',
      title: 'Meta Description',
      status: hasKeyword ? 'pass' : 'warning',
      message: hasKeyword
        ? `Meta description is ${length} characters and includes keyword`
        : `Meta description is ${length} characters but missing keyword`,
      impact: 'high',
      category: 'technical'
    };
  }

  return {
    id: 'meta_description',
    title: 'Meta Description',
    status: 'warning',
    message: `Meta description is ${length} characters. Optimal: 120-160.`,
    impact: 'high',
    category: 'technical'
  };
}

function checkSlugOptimization(slug: string, keyword?: string): SEOCheck {
  const isClean = /^[a-z0-9-]+$/.test(slug);
  const length = slug.length;

  if (!isClean) {
    return {
      id: 'slug_optimization',
      title: 'URL Slug',
      status: 'fail',
      message: 'URL contains special characters. Use only lowercase letters, numbers, and hyphens.',
      impact: 'medium',
      category: 'technical'
    };
  }

  if (length > 60) {
    return {
      id: 'slug_optimization',
      title: 'URL Slug',
      status: 'warning',
      message: `URL is ${length} characters. Consider shortening for better SEO.`,
      impact: 'medium',
      category: 'technical'
    };
  }

  const hasKeyword = keyword ? slug.includes(keyword.toLowerCase().replace(/\s+/g, '-')) : false;

  return {
    id: 'slug_optimization',
    title: 'URL Slug',
    status: hasKeyword ? 'pass' : 'warning',
    message: hasKeyword ? 'URL is clean and includes keyword' : 'Consider adding keyword to URL',
    impact: 'medium',
    category: 'technical'
  };
}

function checkHeadingHierarchy(content: string): SEOCheck {
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;

  if (h1Count > 0) {
    return {
      id: 'heading_hierarchy',
      title: 'Heading Hierarchy',
      status: 'fail',
      message: 'Do not use H1 tags in content (reserved for page title)',
      impact: 'high',
      category: 'technical'
    };
  }

  if (h2Count >= 2) {
    return {
      id: 'heading_hierarchy',
      title: 'Heading Hierarchy',
      status: 'pass',
      message: `Good heading structure (${h2Count} H2 headings, ${h3Count} H3 headings)`,
      impact: 'medium',
      category: 'technical'
    };
  }

  return {
    id: 'heading_hierarchy',
    title: 'Heading Hierarchy',
    status: 'warning',
    message: 'Add more H2 headings to organize content into sections',
    impact: 'medium',
    category: 'technical'
  };
}

function checkHTMLStructure(content: string): SEOCheck {
  const hasParagraphs = /<p[^>]*>/i.test(content);
  const hasProperClosing = !/<p[^>]*>(?!.*<\/p>)/i.test(content);

  if (hasParagraphs && hasProperClosing) {
    return {
      id: 'html_structure',
      title: 'HTML Structure',
      status: 'pass',
      message: 'Content has proper HTML structure',
      impact: 'low',
      category: 'technical'
    };
  }

  return {
    id: 'html_structure',
    title: 'HTML Structure',
    status: 'warning',
    message: 'Some HTML tags may not be properly closed',
    impact: 'low',
    category: 'technical'
  };
}

function checkKeywordDensity(content: string, keyword: string): SEOCheck {
  const plainText = content.replace(/<[^>]*>/g, ' ').toLowerCase();
  const words = plainText.split(/\s+/).filter(w => w.length > 0);
  const keywordLower = keyword.toLowerCase();

  const keywordCount = plainText.split(keywordLower).length - 1;
  const density = (keywordCount / words.length) * 100;

  if (density >= 0.5 && density <= 2.5) {
    return {
      id: 'keyword_density',
      title: 'Keyword Density',
      status: 'pass',
      message: `Keyword appears ${keywordCount} times (${density.toFixed(2)}% density - optimal)`,
      impact: 'medium',
      category: 'keywords'
    };
  } else if (density < 0.5) {
    return {
      id: 'keyword_density',
      title: 'Keyword Density',
      status: 'warning',
      message: `Keyword only appears ${keywordCount} times (${density.toFixed(2)}%). Use it more naturally.`,
      impact: 'medium',
      category: 'keywords'
    };
  } else {
    return {
      id: 'keyword_density',
      title: 'Keyword Density',
      status: 'fail',
      message: `Keyword appears ${keywordCount} times (${density.toFixed(2)}%). Reduce to avoid keyword stuffing.`,
      impact: 'medium',
      category: 'keywords'
    };
  }
}

function checkKeywordInHeadings(content: string, keyword: string): SEOCheck {
  const headings = content.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi) || [];
  const keywordLower = keyword.toLowerCase();

  const headingsWithKeyword = headings.filter(h => {
    const plainText = h.replace(/<[^>]*>/g, '').toLowerCase();
    return plainText.includes(keywordLower);
  });

  if (headingsWithKeyword.length > 0) {
    return {
      id: 'keyword_in_headings',
      title: 'Keyword in Headings',
      status: 'pass',
      message: `Keyword appears in ${headingsWithKeyword.length} heading(s)`,
      impact: 'medium',
      category: 'keywords'
    };
  }

  return {
    id: 'keyword_in_headings',
    title: 'Keyword in Headings',
    status: 'warning',
    message: 'Try to include keyword in at least one heading',
    impact: 'medium',
    category: 'keywords'
  };
}

function checkFeaturedImage(imageUrl?: string): SEOCheck {
  if (imageUrl && imageUrl.length > 0) {
    return {
      id: 'featured_image',
      title: 'Featured Image',
      status: 'pass',
      message: 'Featured image is set',
      impact: 'medium',
      category: 'images'
    };
  }

  return {
    id: 'featured_image',
    title: 'Featured Image',
    status: 'fail',
    message: 'Add a featured image for better social sharing and engagement',
    impact: 'medium',
    category: 'images'
  };
}

function checkImageAltText(content: string): SEOCheck {
  const images = content.match(/<img[^>]+>/gi) || [];
  const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img));

  if (images.length === 0) {
    return {
      id: 'image_alt_text',
      title: 'Image Alt Text',
      status: 'warning',
      message: 'No images in content. Consider adding visual elements.',
      impact: 'low',
      category: 'images'
    };
  }

  const percentage = (imagesWithAlt.length / images.length) * 100;

  if (percentage === 100) {
    return {
      id: 'image_alt_text',
      title: 'Image Alt Text',
      status: 'pass',
      message: `All ${images.length} images have alt text`,
      impact: 'medium',
      category: 'images'
    };
  } else if (percentage >= 50) {
    return {
      id: 'image_alt_text',
      title: 'Image Alt Text',
      status: 'warning',
      message: `${imagesWithAlt.length}/${images.length} images have alt text. Add to remaining images.`,
      impact: 'medium',
      category: 'images'
    };
  } else {
    return {
      id: 'image_alt_text',
      title: 'Image Alt Text',
      status: 'fail',
      message: `Only ${imagesWithAlt.length}/${images.length} images have alt text. This hurts accessibility and SEO.`,
      impact: 'medium',
      category: 'images'
    };
  }
}

function checkImageCount(content: string): SEOCheck {
  const images = content.match(/<img[^>]+>/gi) || [];

  if (images.length >= 2) {
    return {
      id: 'image_count',
      title: 'Image Count',
      status: 'pass',
      message: `${images.length} images found. Good visual engagement.`,
      impact: 'low',
      category: 'images'
    };
  } else if (images.length === 1) {
    return {
      id: 'image_count',
      title: 'Image Count',
      status: 'warning',
      message: 'Only 1 image. Consider adding more visuals.',
      impact: 'low',
      category: 'images'
    };
  }

  return {
    id: 'image_count',
    title: 'Image Count',
    status: 'warning',
    message: 'No images in content. Add visuals to improve engagement.',
    impact: 'low',
    category: 'images'
  };
}

function checkInternalLinks(content: string): SEOCheck {
  const internalLinks = (content.match(/href=["']\/[^"']*["']/gi) || []).length;

  if (internalLinks >= 3) {
    return {
      id: 'internal_links',
      title: 'Internal Links',
      status: 'pass',
      message: `${internalLinks} internal links found. Good site structure.`,
      impact: 'medium',
      category: 'links'
    };
  } else if (internalLinks >= 1) {
    return {
      id: 'internal_links',
      title: 'Internal Links',
      status: 'warning',
      message: `Only ${internalLinks} internal link(s). Add 2-3 more for better SEO.`,
      impact: 'medium',
      category: 'links'
    };
  }

  return {
    id: 'internal_links',
    title: 'Internal Links',
    status: 'fail',
    message: 'No internal links found. Link to related content on your site.',
    impact: 'medium',
    category: 'links'
  };
}

function checkExternalLinks(content: string): SEOCheck {
  const externalLinks = (content.match(/href=["']https?:\/\/[^"']*["']/gi) || []).length;

  if (externalLinks >= 1 && externalLinks <= 3) {
    return {
      id: 'external_links',
      title: 'External Links',
      status: 'pass',
      message: `${externalLinks} external link(s) to authoritative sources`,
      impact: 'low',
      category: 'links'
    };
  } else if (externalLinks === 0) {
    return {
      id: 'external_links',
      title: 'External Links',
      status: 'warning',
      message: 'No external links. Consider citing authoritative sources.',
      impact: 'low',
      category: 'links'
    };
  }

  return {
    id: 'external_links',
    title: 'External Links',
    status: 'warning',
    message: `${externalLinks} external links. Ensure they add value and aren't excessive.`,
    impact: 'low',
    category: 'links'
  };
}

function checkContentDepth(content: string): SEOCheck {
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  const plainText = content.replace(/<[^>]*>/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 800 && h2Count >= 3) {
    return {
      id: 'content_depth',
      title: 'Content Depth',
      status: 'pass',
      message: 'Content has good depth with multiple sections',
      impact: 'high',
      category: 'content'
    };
  } else if (wordCount >= 500) {
    return {
      id: 'content_depth',
      title: 'Content Depth',
      status: 'warning',
      message: 'Content could be more comprehensive. Add more sections.',
      impact: 'high',
      category: 'content'
    };
  }

  return {
    id: 'content_depth',
    title: 'Content Depth',
    status: 'fail',
    message: 'Content lacks depth. Expand with more detailed information.',
    impact: 'high',
    category: 'content'
  };
}

function calculateBreakdown(checks: SEOCheck[]): any {
  const categories = ['content', 'technical', 'keywords', 'images'];
  const breakdown: any = {};

  categories.forEach(category => {
    const categoryChecks = checks.filter(c => c.category === category);
    const passed = categoryChecks.filter(c => c.status === 'pass').length;
    breakdown[category] = categoryChecks.length > 0
      ? Math.round((passed / categoryChecks.length) * 100)
      : 0;
  });

  return breakdown;
}

function generateSuggestions(checks: SEOCheck[]): string[] {
  return checks
    .filter(c => c.status === 'fail' || c.status === 'warning')
    .sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    })
    .slice(0, 5)
    .map(c => c.message);
}
