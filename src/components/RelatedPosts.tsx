import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getRelatedPosts, RelatedPost } from '../utils/relatedPostsSelector';

interface RelatedPostsProps {
  currentPostId: string;
  currentTitle: string;
  currentContent: string;
  currentKeyword?: string;
}

export default function RelatedPosts({
  currentPostId,
  currentTitle,
  currentContent,
  currentKeyword
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId]);

  const loadRelatedPosts = async () => {
    setLoading(true);
    const posts = await getRelatedPosts(
      currentPostId,
      currentTitle,
      currentContent,
      currentKeyword
    );
    setRelatedPosts(posts);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mb-16">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading related posts...</p>
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-7 h-7 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900">Related Articles</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-blue-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>

              {post.excerpt && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatDate(post.published_at)}
                </span>
                <div className="flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
