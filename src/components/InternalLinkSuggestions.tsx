import { useState, useEffect } from 'react';
import { Link as LinkIcon, TrendingUp, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LinkSuggestion {
  targetPostId: string;
  targetTitle: string;
  targetSlug: string;
  anchorText: string;
  relevanceScore: number;
  contextSnippet: string;
}

interface InternalLinkSuggestionsProps {
  currentPostId?: string;
  content: string;
  primaryKeyword?: string;
  onLinksUpdated?: (newContent: string) => void;
}

export default function InternalLinkSuggestions({
  currentPostId,
  content,
  primaryKeyword,
  onLinksUpdated
}: InternalLinkSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLinks, setCurrentLinks] = useState(0);

  useEffect(() => {
    countExistingLinks();
  }, [content]);

  useEffect(() => {
    if (content && content.length > 100) {
      generateSuggestions();
    }
  }, [content, primaryKeyword]);

  const countExistingLinks = () => {
    const internalLinks = (content.match(/href=["']\/[^"']*["']/gi) || []).length;
    setCurrentLinks(internalLinks);
  };

  const generateSuggestions = async () => {
    setLoading(true);

    try {
      // Fetch all published posts
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, primary_keyword')
        .eq('status', 'published')
        .eq('deleted', false)
        .neq('id', currentPostId || '00000000-0000-0000-0000-000000000000')
        .limit(20);

      if (!posts || posts.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Simple keyword-based relevance scoring
      const contentLower = content.toLowerCase();
      const keywordLower = primaryKeyword?.toLowerCase() || '';

      const scored = posts
        .map(post => {
          let relevance = 0;

          // Score based on keyword match
          if (keywordLower && post.primary_keyword?.toLowerCase().includes(keywordLower)) {
            relevance += 30;
          }

          // Score based on title match
          const titleWords = post.title.toLowerCase().split(/\s+/);
          const contentWords = new Set(contentLower.split(/\s+/));
          const matchingWords = titleWords.filter((w: string) => contentWords.has(w) && w.length > 3);
          relevance += matchingWords.length * 10;

          // Score based on excerpt match
          if (post.excerpt) {
            const excerptWords = post.excerpt.toLowerCase().split(/\s+/);
            const excerptMatches = excerptWords.filter((w: string) => contentWords.has(w) && w.length > 4);
            relevance += excerptMatches.length * 5;
          }

          return {
            targetPostId: post.id,
            targetTitle: post.title,
            targetSlug: post.slug,
            anchorText: generateAnchorText(post.title, post.primary_keyword),
            relevanceScore: relevance,
            contextSnippet: post.excerpt || post.content.slice(0, 150)
          };
        })
        .filter(s => s.relevanceScore > 10)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);

      setSuggestions(scored);
    } catch (error) {
      console.error('Error generating link suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertLink = (suggestion: LinkSuggestion) => {
    const linkHTML = `<a href="/blog/${suggestion.targetSlug}">${suggestion.anchorText}</a>`;

    // Find a good place to insert the link
    // For simplicity, we'll append it to the end of the first paragraph
    const firstParagraphMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);

    if (firstParagraphMatch) {
      const updatedParagraph = firstParagraphMatch[0].replace(
        '</p>',
        ` ${linkHTML}.</p>`
      );
      const newContent = content.replace(firstParagraphMatch[0], updatedParagraph);

      if (onLinksUpdated) {
        onLinksUpdated(newContent);
      }

      // Remove this suggestion
      setSuggestions(prev => prev.filter(s => s.targetPostId !== suggestion.targetPostId));
      setCurrentLinks(prev => prev + 1);
    }
  };

  const dismissSuggestion = (postId: string) => {
    setSuggestions(prev => prev.filter(s => s.targetPostId !== postId));
  };

  const getLinksStatus = () => {
    if (currentLinks >= 3) {
      return { color: 'text-green-600', bg: 'bg-green-50', label: 'Great!' };
    } else if (currentLinks >= 1) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Good' };
    }
    return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Add more' };
  };

  const status = getLinksStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg">Internal Links</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
          {currentLinks} links
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-sm">Link Status: {status.label}</span>
        </div>
        <p className="text-xs text-gray-600">
          Recommended: 2-4 internal links per post for better SEO
        </p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Finding relevant posts...</p>
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="text-center py-8">
          <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {content.length < 100
              ? 'Write more content to get link suggestions'
              : 'No relevant posts found for linking'}
          </p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">Suggested Links:</h4>

          {suggestions.map(suggestion => (
            <div
              key={suggestion.targetPostId}
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm text-gray-900 mb-1">
                    {suggestion.targetTitle}
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {suggestion.contextSnippet.slice(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {suggestion.relevanceScore}% relevant
                    </span>
                    <span className="text-xs text-gray-500">
                      Anchor: "{suggestion.anchorText}"
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => dismissSuggestion(suggestion.targetPostId)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => insertLink(suggestion)}
                className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Link to Content
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-2 text-sm">Internal Linking Tips:</h4>
        <ul className="text-xs text-purple-800 space-y-1">
          <li>• Link to related content that adds value for readers</li>
          <li>• Use descriptive anchor text (not "click here")</li>
          <li>• Aim for 2-4 internal links per post</li>
          <li>• Link to both pillar content and related posts</li>
        </ul>
      </div>
    </div>
  );
}

function generateAnchorText(title: string, keyword?: string): string {
  // Prefer keyword if available
  if (keyword) {
    return keyword;
  }

  // Otherwise use first few words of title
  const words = title.split(/\s+/).slice(0, 4).join(' ');
  return words.length > 50 ? words.slice(0, 47) + '...' : words;
}
