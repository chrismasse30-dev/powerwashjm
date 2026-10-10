import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import { Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updatePageMeta, addStructuredData, createBreadcrumbSchema } from '../utils/seo';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_id: string;
  featured_image_url: string;
  publish_date: string | null;
  published_at: string | null;
  view_count: number;
}

export default function BlogPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updatePageMeta({
      title: 'Power Washing & Holiday Lighting Blog | Expert Tips & Guides | J&M',
      description: 'Expert tips, seasonal guides, and insights for power washing, roof cleaning, and holiday lighting. Learn how to maintain your RI & MA property year-round from professional exterior cleaning experts.',
      keywords: 'power washing blog, pressure washing tips, roof cleaning guide, holiday lights advice, house washing tips, exterior cleaning blog, Rhode Island, Massachusetts',
      ogImage: 'https://powerwashjm.com/logos/logo.png',
      canonical: 'https://powerwashjm.com/blog'
    });

    const breadcrumbSchema = createBreadcrumbSchema([
      { name: 'Home', url: 'https://powerwashjm.com' },
      { name: 'Blog', url: 'https://powerwashjm.com/blog' }
    ]);
    addStructuredData(breadcrumbSchema);

    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'J&M Power Washing & Holiday Lights Blog',
      'description': 'Expert tips and insights for power washing, roof cleaning, and holiday lighting in Rhode Island and Massachusetts',
      'url': 'https://powerwashjm.com/blog',
      'publisher': {
        '@type': 'Organization',
        'name': 'J&M Power Washing & Holiday Lights',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://powerwashjm.com/logos/logo.png'
        }
      }
    };
    addStructuredData(blogSchema);

    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, author_id, featured_image_url, publish_date, published_at, view_count')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Error fetching blog posts:', error);
    }

    if (data) setPosts(data);
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div style={getNavOffsetWithBreadcrumb()} className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 mt-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Power Washing & Holiday Lighting <span className="text-blue-600">Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Expert tips, seasonal guides, and insights for maintaining your property year-round
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">No blog posts yet</p>
              <p className="text-gray-400 mt-2">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.published_at || post.publish_date)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
