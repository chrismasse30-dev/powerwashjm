import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Clock, Eye, AlertCircle, CreditCard as Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: string;
  featured_image_url: string;
  publish_date: string;
  status: 'draft' | 'scheduled' | 'published';
  view_count: number;
  created_at: string;
}

export default function BlogPostPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/blog');
        return;
      }

      if (id) {
        fetchPost();
      }
    }
  }, [id, user, isAdmin, authLoading]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching post:', error);
        alert('Failed to load blog post preview.');
        navigate('/blog-management');
        return;
      }

      if (!data) {
        alert('Blog post not found.');
        navigate('/blog-management');
        return;
      }

      setPost(data);

      // Update meta tags for preview (with noindex to prevent SEO issues)
      document.title = `Preview: ${data.title} | J & M Power Washing`;

      // Add noindex meta tag to prevent search engine indexing
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } catch (err) {
      console.error('Error loading post preview:', err);
      alert('An error occurred while loading the preview.');
      navigate('/blog-management');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getStatusBadge = () => {
    if (!post) return null;

    const badges = {
      draft: { color: 'bg-gray-600', text: 'Draft' },
      scheduled: { color: 'bg-blue-600', text: 'Scheduled' },
      published: { color: 'bg-green-600', text: 'Published' }
    };

    const badge = badges[post.status];
    return (
      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
        {badge.text}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div style={getNavOffsetWithBreadcrumb()} className="pb-16">
        <div className="w-full max-w-7xl mx-auto text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={getNavOffsetWithBreadcrumb()} className="pb-16">
      <div className="w-full max-w-7xl mx-auto">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Preview Banner */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-1">Preview Mode</h2>
                <p className="text-sm opacity-90 mb-3">
                  {post.status === 'draft' && 'This is a draft post. It is not visible to the public.'}
                  {post.status === 'scheduled' && `This post is scheduled to publish on ${formatDate(post.scheduled_publish_at)}.`}
                  {post.status === 'published' && 'This post is currently live and visible to the public.'}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusBadge()}
                  {post.status === 'scheduled' && (
                    <span className="text-sm opacity-90">
                      Publishes: {formatDate(post.scheduled_publish_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/blog-management/edit/${post.id}`}
                className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Post
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Link
          to="/blog-management"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog Management
        </Link>

        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {post.status === 'published'
                  ? formatDate(post.publish_date)
                  : post.status === 'scheduled'
                  ? `Scheduled: ${formatDate(post.scheduled_publish_at)}`
                  : `Created: ${formatDate(post.created_at)}`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{estimateReadingTime(post.content)} min read</span>
            </div>
            {post.status === 'published' && (
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{post.view_count || 0} views</span>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Post Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            fontSize: '1.125rem',
            lineHeight: '1.75',
            color: '#374151'
          }}
        />

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Property?</h2>
          <p className="text-xl mb-6 opacity-90">Get a free quote for professional power washing services</p>
          <Link
            to="/get-quote/"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Get Your Free Estimate
          </Link>
        </div>

        {/* Preview Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-4">
              This is a preview of how your blog post will appear when published.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to={`/blog-management/edit/${post.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Edit className="w-5 h-5" />
                Continue Editing
              </Link>
              <Link
                to="/blog-management"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Management
              </Link>
            </div>
          </div>
        </div>
        </article>
      </div>
    </div>
  );
}
