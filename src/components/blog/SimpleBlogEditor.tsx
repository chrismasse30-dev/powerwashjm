import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, Eye, Send, Wand2, Image as ImageIcon,
  Calendar, ArrowLeft, Check, AlertCircle, Loader2,
  FileText, Search, Sparkles, X, Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { autoFormatBlogContent, generateExcerpt } from '../../utils/blogFormatter';
import BlogImageUpload from '../BlogImageUpload';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  author_name: string;
  status: 'draft' | 'scheduled' | 'published';
  primary_keyword: string;
  meta_description: string;
  scheduled_publish_at: string | null;
}

interface SEOHint {
  type: 'success' | 'warning' | 'error';
  message: string;
}

const TEMPLATES = [
  { id: 'howto', name: 'How-To Guide', icon: FileText, description: 'Step-by-step instructions' },
  { id: 'tips', name: 'Tips & Tricks', icon: Sparkles, description: 'Quick tips for homeowners' },
  { id: 'seasonal', name: 'Seasonal Post', icon: Calendar, description: 'Season-specific content' },
];

const TEMPLATE_CONTENT: Record<string, { title: string; content: string; keyword: string }> = {
  howto: {
    title: 'How to [Action] Your [Surface] in Rhode Island',
    content: `<h2>Introduction</h2>
<p>Brief introduction explaining the importance of this topic for Rhode Island homeowners.</p>

<h2>What You'll Need</h2>
<ul>
<li><strong>Item 1:</strong> Description</li>
<li><strong>Item 2:</strong> Description</li>
</ul>

<h2>Step-by-Step Guide</h2>

<h3>Step 1: Preparation</h3>
<p>Explain the first step in detail.</p>

<h3>Step 2: The Process</h3>
<p>Explain the main process.</p>

<h3>Step 3: Finishing Up</h3>
<p>Explain the final steps.</p>

<h2>When to Call a Professional</h2>
<p>Explain when DIY isn't enough and professional help is recommended.</p>

<h2>Get a Free Quote</h2>
<p>Contact J&M Power Washing for professional service. Call (401) 595-0726 or request a free estimate today!</p>`,
    keyword: 'power washing Rhode Island'
  },
  tips: {
    title: '[Number] Tips for [Topic] in Rhode Island',
    content: `<h2>Introduction</h2>
<p>Why these tips matter for Rhode Island homeowners.</p>

<h2>Tip 1: [First Tip]</h2>
<p>Detailed explanation of the first tip.</p>

<h2>Tip 2: [Second Tip]</h2>
<p>Detailed explanation of the second tip.</p>

<h2>Tip 3: [Third Tip]</h2>
<p>Detailed explanation of the third tip.</p>

<h2>Tip 4: [Fourth Tip]</h2>
<p>Detailed explanation of the fourth tip.</p>

<h2>Tip 5: [Fifth Tip]</h2>
<p>Detailed explanation of the fifth tip.</p>

<h2>Need Professional Help?</h2>
<p>For best results, trust the experts at J&M Power Washing. Serving Rhode Island and Massachusetts since 2018.</p>`,
    keyword: 'home maintenance Rhode Island'
  },
  seasonal: {
    title: '[Season] Home Maintenance: [Topic] in Rhode Island',
    content: `<h2>Why [Season] Matters for Your Home</h2>
<p>Explain the seasonal challenges Rhode Island homeowners face.</p>

<h2>The Impact of [Season] Weather</h2>
<p>How this season's weather affects home exteriors in our region.</p>

<h2>Recommended Maintenance Tasks</h2>
<ul>
<li><strong>Task 1:</strong> Description and timing</li>
<li><strong>Task 2:</strong> Description and timing</li>
<li><strong>Task 3:</strong> Description and timing</li>
</ul>

<h2>Before & After the Season</h2>
<p>What to do to prepare and what to check afterward.</p>

<h2>Schedule Your Seasonal Service</h2>
<p>J&M Power Washing offers seasonal maintenance programs. Contact us at (401) 595-0726 for scheduling.</p>`,
    keyword: 'seasonal home maintenance RI'
  }
};

export default function SimpleBlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState<'write' | 'seo' | 'preview'>('write');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!isEditing);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    author_name: 'J&M Power Washing Team',
    status: 'draft',
    primary_keyword: '',
    meta_description: '',
    scheduled_publish_at: null
  });

  const [seoHints, setSeoHints] = useState<SEOHint[]>([]);
  const [seoScore, setSeoScore] = useState(0);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  useEffect(() => {
    analyzeSEO();
  }, [post.title, post.content, post.primary_keyword, post.meta_description]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      if (data) {
        setPost({
          id: data.id,
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          featured_image_url: data.featured_image_url || '',
          author_name: data.author_name || 'J&M Power Washing Team',
          status: data.status || 'draft',
          primary_keyword: data.primary_keyword || '',
          meta_description: data.meta_description || '',
          scheduled_publish_at: data.scheduled_publish_at || null
        });
        setShowTemplates(false);
      }
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
      .replace(/-$/, '');
  };

  const extractKeywords = (title: string, content: string): string => {
    const text = `${title} ${content}`.toLowerCase();
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'your', 'you', 'we', 'they', 'them', 'their']);

    const words = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !commonWords.has(w));

    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    const topWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    if (topWords.length === 0) return '';

    const keyword = topWords.join(' ');
    if (keyword.includes('rhode') || keyword.includes('island')) {
      return keyword + ' Rhode Island';
    }
    if (keyword.includes('washing') || keyword.includes('cleaning') || keyword.includes('power')) {
      return keyword + ' RI';
    }
    return keyword;
  };

  const generateMetaDescription = (title: string, content: string): string => {
    const plainText = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const firstParagraph = plainText.split('.')[0] + '.';

    if (firstParagraph.length >= 120 && firstParagraph.length <= 160) {
      return firstParagraph;
    }

    if (firstParagraph.length < 120) {
      const sentences = plainText.split('.').slice(0, 2).join('.') + '.';
      if (sentences.length <= 160) {
        return sentences;
      }
    }

    return plainText.substring(0, 157) + '...';
  };

  const updateField = <K extends keyof BlogPost>(field: K, value: BlogPost[K]) => {
    setPost(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !isEditing) {
        updated.slug = generateSlug(value as string);
      }

      if (field === 'content' && (value as string).length > 100) {
        if (!updated.primary_keyword || updated.primary_keyword === '') {
          updated.primary_keyword = extractKeywords(updated.title, value as string);
        }

        if (!updated.meta_description || updated.meta_description === '') {
          updated.meta_description = generateMetaDescription(updated.title, value as string);
        }
      }

      return updated;
    });
  };

  const analyzeSEO = useCallback(() => {
    const hints: SEOHint[] = [];
    let score = 0;

    if (post.title.length >= 50 && post.title.length <= 60) {
      hints.push({ type: 'success', message: 'Title length is optimal (50-60 chars)' });
      score += 15;
    } else if (post.title.length > 0 && post.title.length < 50) {
      hints.push({ type: 'warning', message: `Title is short (${post.title.length}/50-60 chars)` });
      score += 8;
    } else if (post.title.length > 60) {
      hints.push({ type: 'warning', message: `Title is long (${post.title.length}/60 chars max)` });
      score += 8;
    }

    if (post.primary_keyword) {
      if (post.title.toLowerCase().includes(post.primary_keyword.toLowerCase())) {
        hints.push({ type: 'success', message: 'Keyword in title' });
        score += 15;
      } else {
        hints.push({ type: 'error', message: 'Add keyword to title' });
      }

      const contentLower = post.content.toLowerCase();
      const keywordLower = post.primary_keyword.toLowerCase();
      const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
      const wordCount = post.content.split(/\s+/).length;
      const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

      if (density >= 0.5 && density <= 2.5) {
        hints.push({ type: 'success', message: `Keyword density: ${density.toFixed(1)}%` });
        score += 15;
      } else if (density < 0.5 && keywordCount > 0) {
        hints.push({ type: 'warning', message: `Low keyword density: ${density.toFixed(1)}%` });
        score += 5;
      } else if (density > 2.5) {
        hints.push({ type: 'warning', message: `High keyword density: ${density.toFixed(1)}%` });
        score += 5;
      }
    } else {
      hints.push({ type: 'error', message: 'Set a primary keyword' });
    }

    if (post.meta_description.length >= 120 && post.meta_description.length <= 160) {
      hints.push({ type: 'success', message: 'Meta description length is optimal' });
      score += 15;
    } else if (post.meta_description.length > 0) {
      hints.push({ type: 'warning', message: `Meta description: ${post.meta_description.length}/120-160 chars` });
      score += 8;
    } else {
      hints.push({ type: 'error', message: 'Add meta description' });
    }

    const wordCount = post.content.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount >= 800) {
      hints.push({ type: 'success', message: `Content length: ${wordCount} words` });
      score += 20;
    } else if (wordCount >= 400) {
      hints.push({ type: 'warning', message: `Content: ${wordCount}/800+ words recommended` });
      score += 10;
    } else if (wordCount > 0) {
      hints.push({ type: 'error', message: `Content too short: ${wordCount} words` });
      score += 5;
    }

    const hasH2 = /<h2/i.test(post.content);
    if (hasH2) {
      hints.push({ type: 'success', message: 'Has section headings (H2)' });
      score += 10;
    } else if (post.content.length > 100) {
      hints.push({ type: 'warning', message: 'Add H2 headings for structure' });
    }

    if (post.featured_image_url) {
      hints.push({ type: 'success', message: 'Featured image added' });
      score += 10;
    } else {
      hints.push({ type: 'warning', message: 'Add a featured image' });
    }

    setSeoHints(hints);
    setSeoScore(Math.min(100, score));
  }, [post.title, post.content, post.primary_keyword, post.meta_description, post.featured_image_url]);

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATE_CONTENT[templateId];
    if (template) {
      setPost(prev => ({
        ...prev,
        title: template.title,
        content: template.content,
        primary_keyword: template.keyword,
        slug: generateSlug(template.title),
        meta_description: generateMetaDescription(template.title, template.content)
      }));
      setShowTemplates(false);
    }
  };

  const handleAutoGenerateSEO = () => {
    if (!post.content || post.content.length < 100) {
      alert('Please add some content first (at least 100 characters)');
      return;
    }

    const keyword = extractKeywords(post.title, post.content);
    const metaDesc = generateMetaDescription(post.title, post.content);

    setPost(prev => ({
      ...prev,
      primary_keyword: keyword,
      meta_description: metaDesc
    }));
  };

  const handleAIAssist = async () => {
    if (!post.title || !post.primary_keyword) {
      alert('Please enter a title and primary keyword first');
      return;
    }

    setAiGenerating(true);
    try {
      const outlinePrompt = `
# BLOG POST OUTLINE

Topic: ${post.title}
Primary Keyword: ${post.primary_keyword}

Create a detailed outline with:
- Main sections (H2 headers)
- Subsections (H3 headers)
- Key points to cover
- Minimum 1200 words planned
`;

      const { data: outlineData, error: outlineError } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          generationType: 'outline',
          topic: post.title,
          primaryKeyword: post.primary_keyword,
          tone: 'professional',
          targetLength: 1200
        }
      });

      if (outlineError) throw outlineError;

      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          generationType: 'draft',
          existingContent: outlineData?.content || outlinePrompt,
          topic: post.title,
          primaryKeyword: post.primary_keyword,
          tone: 'professional',
          targetLength: 1200
        }
      });

      if (error) throw error;
      if (data?.content) {
        setPost(prev => ({
          ...prev,
          content: data.content,
          excerpt: prev.excerpt || generateExcerpt(data.content)
        }));
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      alert('AI generation failed. You can write content manually or try again.\n\nError: ' + (err.message || 'Unknown error'));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAutoFormat = () => {
    const formatted = autoFormatBlogContent(post.content);
    setPost(prev => ({
      ...prev,
      content: formatted,
      excerpt: prev.excerpt || generateExcerpt(formatted)
    }));
  };

  const handleSave = async (publishNow = false) => {
    if (!post.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!post.content.trim()) {
      alert('Please add some content');
      return;
    }

    setSaving(true);
    try {
      const formattedContent = autoFormatBlogContent(post.content);
      const excerpt = post.excerpt || generateExcerpt(formattedContent);

      const postData: any = {
        title: post.title,
        slug: post.slug || generateSlug(post.title),
        content: formattedContent,
        excerpt,
        featured_image_url: post.featured_image_url,
        author_name: post.author_name,
        status: publishNow ? 'published' : post.status,
        primary_keyword: post.primary_keyword,
        meta_description: post.meta_description,
        scheduled_publish_at: post.status === 'scheduled' ? post.scheduled_publish_at : null,
        seo_score: seoScore
      };

      if (publishNow) {
        postData.publish_date = new Date().toISOString();
      } else if (!isEditing && post.status === 'published') {
        postData.publish_date = new Date().toISOString();
      }

      let result;
      if (isEditing && post.id) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single();
      }

      if (result.error) {
        if (result.error.code === '23505') {
          const newSlug = `${post.slug}-${Date.now()}`;
          postData.slug = newSlug;
          result = await supabase
            .from('blog_posts')
            .insert(postData)
            .select()
            .single();
          if (result.error) throw result.error;
        } else {
          throw result.error;
        }
      }

      navigate('/blog-management');
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/blog-management')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Post' : 'New Post'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                seoScore >= 70 ? 'bg-green-100 text-green-700' :
                seoScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <Search className="w-4 h-4" />
                SEO: {seoScore}%
              </div>

              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publish
              </button>
            </div>
          </div>

          <div className="flex gap-1 border-t border-gray-100">
            {[
              { id: 'write', label: 'Write', icon: FileText },
              { id: 'seo', label: 'SEO', icon: Search },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showTemplates && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Start with a Template</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <template.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'write' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <input
                  type="text"
                  value={post.title}
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Post title..."
                  className="w-full text-2xl font-bold text-gray-900 border-0 focus:ring-0 p-0 placeholder-gray-400"
                />
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <span>powerwashjm.com/blog/</span>
                  <input
                    type="text"
                    value={post.slug}
                    onChange={e => updateField('slug', e.target.value)}
                    placeholder="url-slug"
                    className="flex-1 border-0 bg-gray-50 rounded px-2 py-1 text-gray-700 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Content</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAutoFormat}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Format
                    </button>
                    <button
                      onClick={handleAIAssist}
                      disabled={aiGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {aiGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      AI Write
                    </button>
                  </div>
                </div>
                <textarea
                  value={post.content}
                  onChange={e => updateField('content', e.target.value)}
                  placeholder="Start writing your blog post... (HTML supported)"
                  rows={20}
                  className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {post.content.split(/\s+/).filter(w => w.length > 0).length} words
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Featured Image</h3>
                <BlogImageUpload
                  currentImageUrl={post.featured_image_url}
                  onImageUploaded={url => updateField('featured_image_url', url)}
                  onImageRemoved={() => updateField('featured_image_url', '')}
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Quick SEO</h3>
                  <button
                    onClick={handleAutoGenerateSEO}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Auto-generate from content"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-fill
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Keyword
                    </label>
                    <input
                      type="text"
                      value={post.primary_keyword}
                      onChange={e => updateField('primary_keyword', e.target.value)}
                      placeholder="e.g., house washing Rhode Island"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated when you add content</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={post.meta_description}
                      onChange={e => updateField('meta_description', e.target.value)}
                      placeholder="Brief description for search results..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {post.meta_description.length}/160 characters • Auto-generated from content
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Publishing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex gap-2">
                      {['draft', 'scheduled', 'published'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateField('status', status as BlogPost['status'])}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            post.status === status
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {post.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Schedule Date
                      </label>
                      <input
                        type="datetime-local"
                        value={post.scheduled_publish_at?.slice(0, 16) || ''}
                        onChange={e => updateField('scheduled_publish_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input
                      type="text"
                      value={post.author_name}
                      onChange={e => updateField('author_name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">SEO Score</h3>
                <div className={`text-3xl font-bold ${
                  seoScore >= 70 ? 'text-green-600' :
                  seoScore >= 40 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {seoScore}%
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className={`h-3 rounded-full transition-all ${
                    seoScore >= 70 ? 'bg-green-500' :
                    seoScore >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>

              <div className="space-y-3">
                {seoHints.map((hint, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      hint.type === 'success' ? 'bg-green-50' :
                      hint.type === 'warning' ? 'bg-yellow-50' :
                      'bg-red-50'
                    }`}
                  >
                    {hint.type === 'success' ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : hint.type === 'warning' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      hint.type === 'success' ? 'text-green-700' :
                      hint.type === 'warning' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {hint.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title ({post.title.length}/60)
                  </label>
                  <input
                    type="text"
                    value={post.title}
                    onChange={e => updateField('title', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                      post.title.length > 60 ? 'border-red-300' :
                      post.title.length >= 50 ? 'border-green-300' :
                      'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Keyword
                  </label>
                  <input
                    type="text"
                    value={post.primary_keyword}
                    onChange={e => updateField('primary_keyword', e.target.value)}
                    placeholder="Target keyword for this post"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/blog/</span>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={e => updateField('slug', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description ({post.meta_description.length}/160)
                  </label>
                  <textarea
                    value={post.meta_description}
                    onChange={e => updateField('meta_description', e.target.value)}
                    rows={3}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                      post.meta_description.length > 160 ? 'border-red-300' :
                      post.meta_description.length >= 120 ? 'border-green-300' :
                      'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    value={post.excerpt}
                    onChange={e => updateField('excerpt', e.target.value)}
                    placeholder="Brief summary for blog listings..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {post.featured_image_url && (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-xl mb-8"
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title || 'Untitled Post'}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
                <span>By {post.author_name}</span>
                <span>|</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || '<p>No content yet...</p>' }}
              />
            </article>
          </div>
        )}
      </main>
    </div>
  );
}
