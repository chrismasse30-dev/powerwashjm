import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import { Calendar, User, ArrowLeft, Clock, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { injectSchemaIntoHead } from '../utils/schemaGenerator';
import RelatedPosts from '../components/RelatedPosts';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: string;
  featured_image_url: string;
  publish_date: string;
  view_count: number;
  schema_markup: any;
  primary_keyword: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
      incrementViewCount();
    }
  }, [slug]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error('Error fetching blog post:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setPost(data);

      const canonicalUrl = `https://powerwashjm.com/blog/${data.slug}/`;
      document.title = `${data.title} | J&M Power Washing & Holiday Lights`;

      const keywordsContent = data.primary_keyword
        ? `${data.primary_keyword}, power washing RI, Rhode Island, Massachusetts`
        : 'power washing RI, Rhode Island, Massachusetts';

      const ogTags = [
        { property: 'og:title', content: data.title },
        { property: 'og:description', content: data.excerpt },
        { property: 'og:image', content: data.featured_image_url },
        { property: 'og:image:alt', content: data.title },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: 'J&M Power Washing & Holiday Lights' },
        { property: 'fb:app_id', content: '1251651696729898' },
        { property: 'article:published_time', content: data.publish_date },
        { property: 'article:modified_time', content: data.updated_at || data.publish_date },
        { property: 'article:author', content: 'J & M Power Washing' },
        { property: 'article:section', content: 'Exterior Cleaning' },
        { name: 'description', content: data.excerpt },
        { name: 'keywords', content: keywordsContent },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: data.title },
        { name: 'twitter:description', content: data.excerpt },
        { name: 'twitter:image', content: data.featured_image_url },
        { name: 'twitter:image:alt', content: data.title },
        { name: 'robots', content: 'index, follow' }
      ];

      ogTags.forEach(tag => {
        const attr = tag.property ? 'property' : 'name';
        const value = tag.property || tag.name;
        let element = document.querySelector(`meta[${attr}="${value}"]`);

        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attr, value);
          document.head.appendChild(element);
        }

        element.setAttribute('content', tag.content);
      });

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);

      // Always inject Article schema for blog posts
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        description: data.excerpt,
        image: data.featured_image_url,
        datePublished: data.publish_date,
        dateModified: data.publish_date,
        author: {
          '@type': 'Organization',
          name: 'J&M Power Washing',
          url: 'https://powerwashjm.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'J&M Power Washing & Holiday Lights',
          logo: {
            '@type': 'ImageObject',
            url: 'https://powerwashjm.com/logos/logo.png',
            width: 512,
            height: 512
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      };

      injectSchemaIntoHead(articleSchema, 'blog-article-schema');

      // Inject custom schema markup if available
      if (data.schema_markup) {
        injectSchemaIntoHead(data.schema_markup);
      }
    } else {
      navigate('/blog');
    }
    setLoading(false);
  };

  const incrementViewCount = async () => {
    await supabase.rpc('increment_blog_view_count', { post_slug: slug });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not available';
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

  if (loading) {
    return (
      <div style={getNavOffsetWithBreadcrumb()} className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={getNavOffsetWithBreadcrumb()} className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.publish_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{estimateReadingTime(post.content)} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{post.view_count} views</span>
              </div>
            </div>
          </header>

          {post.featured_image_url && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.75',
              color: '#374151'
            }}
          />

          {/* Related Posts Section - Above CTA */}
          <RelatedPosts
            currentPostId={post.id}
            currentTitle={post.title}
            currentContent={post.content}
            currentKeyword={post.primary_keyword}
          />

          {/* Call to Action Box */}
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
        </article>
      </div>
    </div>
  );
}
