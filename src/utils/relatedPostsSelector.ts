import { supabase } from '../lib/supabase';

export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  primary_keyword: string;
  relevanceScore: number;
}

/**
 * Selects the 3 most relevant blog posts based on content similarity and keywords
 */
export async function getRelatedPosts(
  currentPostId: string,
  currentTitle: string,
  currentContent: string,
  currentKeyword?: string
): Promise<RelatedPost[]> {
  try {
    // Fetch all published posts except current one
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image_url, published_at, primary_keyword, content')
      .eq('status', 'published')
      .eq('deleted', false)
      .neq('id', currentPostId)
      .order('published_at', { ascending: false })
      .limit(30); // Analyze recent 30 posts for performance

    if (!posts || posts.length === 0) {
      return [];
    }

    // Calculate relevance scores
    const scoredPosts = posts.map(post => {
      const score = calculateRelevanceScore(
        currentTitle,
        currentContent,
        currentKeyword,
        post.title,
        post.content,
        post.excerpt,
        post.primary_keyword
      );

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        featured_image_url: post.featured_image_url || '',
        published_at: post.published_at,
        primary_keyword: post.primary_keyword || '',
        relevanceScore: score
      };
    });

    // Sort by relevance and return top 3
    return scoredPosts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

/**
 * Calculate relevance score between current post and a candidate post
 */
function calculateRelevanceScore(
  currentTitle: string,
  currentContent: string,
  currentKeyword: string | undefined,
  postTitle: string,
  postContent: string,
  postExcerpt: string,
  postKeyword: string | undefined
): number {
  let score = 0;

  // Normalize text
  const currentTitleLower = currentTitle.toLowerCase();
  const currentContentLower = currentContent.toLowerCase();
  const currentKeywordLower = currentKeyword?.toLowerCase() || '';
  const postTitleLower = postTitle.toLowerCase();
  const postContentLower = postContent.toLowerCase();
  const postExcerptLower = postExcerpt.toLowerCase();
  const postKeywordLower = postKeyword?.toLowerCase() || '';

  // 1. Primary keyword match (highest weight - 40 points)
  if (currentKeywordLower && postKeywordLower) {
    if (currentKeywordLower === postKeywordLower) {
      score += 40;
    } else if (
      currentKeywordLower.includes(postKeywordLower) ||
      postKeywordLower.includes(currentKeywordLower)
    ) {
      score += 25;
    }
  }

  // 2. Keyword in content match (30 points)
  if (currentKeywordLower && postContentLower.includes(currentKeywordLower)) {
    score += 30;
  }
  if (postKeywordLower && currentContentLower.includes(postKeywordLower)) {
    score += 30;
  }

  // 3. Title word overlap (20 points)
  const currentTitleWords = extractSignificantWords(currentTitleLower);
  const postTitleWords = extractSignificantWords(postTitleLower);
  const titleOverlap = calculateWordOverlap(currentTitleWords, postTitleWords);
  score += titleOverlap * 20;

  // 4. Content keyword overlap (20 points)
  const currentContentWords = extractSignificantWords(currentContentLower);
  const postContentWords = extractSignificantWords(postContentLower);
  const contentOverlap = calculateWordOverlap(currentContentWords, postContentWords);
  score += contentOverlap * 20;

  // 5. Common important terms (bonus 15 points)
  const commonTerms = findCommonImportantTerms(currentContentLower, postContentLower);
  score += commonTerms.length * 3;

  // 6. Category/topic similarity based on keywords (10 points)
  const categoryBonus = detectCategoryMatch(currentKeywordLower, postKeywordLower);
  score += categoryBonus;

  return Math.min(Math.round(score), 100); // Cap at 100
}

/**
 * Extract significant words (3+ characters, excluding common words)
 */
function extractSignificantWords(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'your',
    'from', 'they', 'this', 'that', 'with', 'have', 'been', 'will', 'what',
    'when', 'where', 'which', 'who', 'how', 'about', 'their', 'more', 'than',
    'other', 'into', 'our', 'some', 'these', 'would', 'there', 'like'
  ]);

  const words = text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .match(/\b[a-z]{3,}\b/g) || [];

  return new Set(
    words.filter(word => !stopWords.has(word))
  );
}

/**
 * Calculate word overlap percentage between two sets
 */
function calculateWordOverlap(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / Math.min(set1.size, set2.size);
}

/**
 * Find common important terms (specific industry terms)
 */
function findCommonImportantTerms(text1: string, text2: string): string[] {
  const importantTerms = [
    'power wash', 'pressure wash', 'soft wash', 'house wash',
    'roof clean', 'gutter clean', 'deck clean', 'concrete clean',
    'fence clean', 'driveway', 'siding', 'vinyl', 'wood',
    'holiday lights', 'christmas lights', 'exterior clean',
    'rhode island', 'providence', 'massachusetts', 'new england'
  ];

  return importantTerms.filter(term =>
    text1.includes(term) && text2.includes(term)
  );
}

/**
 * Detect if posts are in the same category based on keywords
 */
function detectCategoryMatch(keyword1: string, keyword2: string): number {
  if (!keyword1 || !keyword2) return 0;

  const categories = [
    ['power wash', 'pressure wash', 'soft wash', 'house wash', 'exterior clean'],
    ['roof clean', 'roof wash', 'roof treatment'],
    ['gutter clean', 'gutter', 'downspout'],
    ['deck clean', 'deck restoration', 'deck stain'],
    ['concrete clean', 'driveway clean', 'patio clean'],
    ['fence clean', 'fence restoration', 'fence stain'],
    ['holiday lights', 'christmas lights', 'lighting'],
    ['commercial', 'business', 'property management']
  ];

  for (const category of categories) {
    const keyword1Match = category.some(term => keyword1.includes(term));
    const keyword2Match = category.some(term => keyword2.includes(term));

    if (keyword1Match && keyword2Match) {
      return 10;
    }
  }

  return 0;
}
