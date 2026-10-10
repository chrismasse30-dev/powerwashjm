import { supabase } from '../lib/supabase';

export interface DuplicateMatch {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  matchReason: 'identical_slug' | 'identical_title' | 'similar_content';
  similarity?: number;
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: DuplicateMatch[];
  canProceed: boolean;
}

/**
 * Check if a blog post has duplicates based on slug, title, or content similarity
 */
export async function checkForDuplicates(
  currentPostId: string | undefined,
  title: string,
  slug: string,
  content: string
): Promise<DuplicateCheckResult> {
  const duplicates: DuplicateMatch[] = [];

  try {
    // Check 1: Exact slug match (most critical - violates unique constraint)
    const { data: slugMatches } = await supabase
      .from('blog_posts')
      .select('id, title, slug, status, created_at, updated_at')
      .eq('slug', slug)
      .eq('deleted', false);

    if (slugMatches && slugMatches.length > 0) {
      slugMatches.forEach((match) => {
        // Exclude the current post if editing
        if (!currentPostId || match.id !== currentPostId) {
          duplicates.push({
            ...match,
            matchReason: 'identical_slug',
            similarity: 100
          });
        }
      });
    }

    // Check 2: Exact title match
    if (duplicates.length === 0) {
      const { data: titleMatches } = await supabase
        .from('blog_posts')
        .select('id, title, slug, status, created_at, updated_at')
        .eq('title', title)
        .eq('deleted', false);

      if (titleMatches && titleMatches.length > 0) {
        titleMatches.forEach((match) => {
          if (!currentPostId || match.id !== currentPostId) {
            duplicates.push({
              ...match,
              matchReason: 'identical_title',
              similarity: 100
            });
          }
        });
      }
    }

    // Check 3: Similar content (basic word overlap check)
    // Only perform if no exact matches found and content is substantial
    if (duplicates.length === 0 && content.length > 500) {
      const { data: allPosts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, status, content, created_at, updated_at')
        .eq('deleted', false)
        .limit(50); // Limit to recent posts for performance

      if (allPosts && allPosts.length > 0) {
        const contentWords = extractKeyWords(content);

        allPosts.forEach((post) => {
          if (!currentPostId || post.id !== currentPostId) {
            const postWords = extractKeyWords(post.content);
            const similarity = calculateSimilarity(contentWords, postWords);

            // Flag as potential duplicate if >70% similar
            if (similarity > 70) {
              duplicates.push({
                id: post.id,
                title: post.title,
                slug: post.slug,
                status: post.status,
                created_at: post.created_at,
                updated_at: post.updated_at,
                matchReason: 'similar_content',
                similarity
              });
            }
          }
        });
      }
    }

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
      canProceed: duplicates.length === 0
    };
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    // In case of error, allow proceeding (fail open)
    return {
      hasDuplicates: false,
      duplicates: [],
      canProceed: true
    };
  }
}

/**
 * Extract significant words from content for similarity comparison
 */
function extractKeyWords(text: string): Set<string> {
  const words = new Set<string>();

  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, ' ');

  // Extract words (3+ characters, alphabetic)
  const matches = cleanText.toLowerCase().match(/\b[a-z]{3,}\b/g);

  if (matches) {
    // Filter out common stop words
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']);

    matches.forEach(word => {
      if (!stopWords.has(word)) {
        words.add(word);
      }
    });
  }

  return words;
}

/**
 * Calculate similarity percentage between two sets of words
 */
function calculateSimilarity(words1: Set<string>, words2: Set<string>): number {
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Create a versioned backup of a blog post before overwriting
 */
export async function createPostVersion(postId: string): Promise<boolean> {
  try {
    // Get the current post data
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      console.error('Error fetching post for versioning:', fetchError);
      return false;
    }

    // Create version entry
    const { error: versionError } = await supabase
      .from('blog_post_versions')
      .insert({
        original_post_id: postId,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        author_name: post.author_name,
        featured_image_url: post.featured_image_url,
        status: post.status,
        meta_description: post.meta_description,
        primary_keyword: post.primary_keyword,
        seo_score: post.seo_score,
        schema_markup: post.schema_markup,
        version_number: await getNextVersionNumber(postId),
        created_at_original: post.created_at
      });

    if (versionError) {
      console.error('Error creating version:', versionError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createPostVersion:', error);
    return false;
  }
}

/**
 * Get the next version number for a post
 */
async function getNextVersionNumber(postId: string): Promise<number> {
  const { data, error } = await supabase
    .from('blog_post_versions')
    .select('version_number')
    .eq('original_post_id', postId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }

  return (data[0].version_number || 0) + 1;
}
