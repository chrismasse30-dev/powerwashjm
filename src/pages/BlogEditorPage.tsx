import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, AlertCircle, Check, Wand2, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import BlogImageUpload from '../components/BlogImageUpload';
import SchemaGenerator from '../components/SchemaGenerator';
import ReadabilityOptimizer from '../components/ReadabilityOptimizer';
import SEOCoach from '../components/SEOCoach';
import KeywordOptimizer from '../components/KeywordOptimizer';
import DuplicateResolutionModal from '../components/DuplicateResolutionModal';
import SaveConfirmationModal from '../components/SaveConfirmationModal';
import AIBlogAssistant from '../components/AIBlogAssistant';
import { supabase } from '../lib/supabase';
import { autoFormatBlogContent, generateExcerpt } from '../utils/blogFormatter';
import { optimizeAllImagesInContent } from '../utils/imageSEOOptimizer';
import { checkForDuplicates, createPostVersion, DuplicateMatch } from '../utils/duplicateDetection';

interface BlogPostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  featured_image_url: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_publish_at: string;
  primary_keyword: string;
  meta_description: string;
  schema_markup: any;
  seo_score: number;
}

export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<string>('');
  const [optimizationApplied, setOptimizationApplied] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [pendingSaveAction, setPendingSaveAction] = useState<'save' | 'publish' | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingBeforeReturn, setIsSavingBeforeReturn] = useState(false);

  // Helper function to get default scheduled publish date (14 days from now at 12:30 PM)
  const getDefaultScheduledDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Add 14 days
    date.setHours(12, 30, 0, 0); // Set to 12:30 PM

    // Format for datetime-local input: YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [form, setForm] = useState<BlogPostForm>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author_name: 'J&M Power Washing',
    featured_image_url: '',
    status: 'draft',
    scheduled_publish_at: getDefaultScheduledDate(),
    primary_keyword: '',
    meta_description: '',
    schema_markup: null,
    seo_score: 0
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    if (form.title && (!id || id === 'new')) {
      let slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Limit slug to 60 characters for better SEO and readability
      if (slug.length > 60) {
        // Find the last complete word within 60 chars
        slug = slug.substring(0, 60);
        const lastDash = slug.lastIndexOf('-');
        if (lastDash > 0) {
          slug = slug.substring(0, lastDash);
        }
      }

      setForm(f => ({ ...f, slug }));
    }
  }, [form.title]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching post:', error);
        alert('Failed to load blog post. Returning to blog management.');
        navigate('/blog-management');
        return;
      }

      if (!data) {
        alert('Blog post not found. Returning to blog management.');
        navigate('/blog-management');
        return;
      }

      setForm({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || '',
        author_name: data.author_name || '',
        featured_image_url: data.featured_image_url || '',
        status: data.status,
        scheduled_publish_at: data.scheduled_publish_at || '',
        primary_keyword: data.primary_keyword || '',
        meta_description: data.meta_description || '',
        schema_markup: data.schema_markup || null,
        seo_score: data.seo_score || 0
      });
    } catch (err) {
      console.error('Error loading post:', err);
      alert('An error occurred while loading the post. Returning to blog management.');
      navigate('/blog-management');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';
    if (!form.content.trim()) newErrors.content = 'Content is required';
    if (form.status === 'scheduled' && !form.scheduled_publish_at) {
      newErrors.scheduled_publish_at = 'Scheduled date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAutoFormat = () => {
    if (!form.content || !form.content.trim()) {
      return;
    }

    try {
      const formatted = autoFormatBlogContent(form.content);
      const newExcerpt = generateExcerpt(formatted);
      setForm(f => ({
        ...f,
        content: formatted,
        excerpt: newExcerpt
      }));
    } catch (error) {
      console.error('Error formatting content:', error);
      setErrors({ content: 'Failed to format content. Please check your content and try again.' });
    }
  };

  const handleOptimizePost = () => {
    // Scroll to SEO section
    setTimeout(() => {
      const seoSection = document.getElementById('seo-optimization-section');
      if (seoSection) {
        seoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    // Show message to guide user
    setSaveSuccess('Review your SEO settings below and click "Apply Optimization" when ready.');
    setTimeout(() => setSaveSuccess(''), 5000);
  };

  const handleApplyOptimization = () => {
    // Auto-format the content first
    if (form.content && form.content.trim()) {
      const formatted = autoFormatBlogContent(form.content);
      const newExcerpt = generateExcerpt(formatted);

      // Optimize images with alt text
      const optimizedContent = optimizeAllImagesInContent(
        formatted,
        form.title,
        form.primary_keyword
      );

      setForm(f => ({
        ...f,
        content: optimizedContent,
        excerpt: newExcerpt
      }));

      // Mark as optimized
      setOptimizationApplied(true);

      // Show success message
      setSaveSuccess('✓ Optimization applied successfully! Content formatted and SEO-optimized.');
      setTimeout(() => setSaveSuccess(''), 5000);

      // Scroll back to top to see the optimized content
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
    }
  };

  const handleSave = async (actionType?: 'save' | 'publish', skipDuplicateCheck = false) => {
    if (!validate()) return;

    setSaving(true);
    setSaveSuccess('');

    // Check authentication using AuthContext
    if (!user) {
      alert('You must be logged in to save blog posts. Please log in and try again.');
      setSaving(false);
      return;
    }

    // Check for duplicates (unless explicitly skipped)
    if (!skipDuplicateCheck) {
      const duplicateCheck = await checkForDuplicates(
        id !== 'new' ? id : undefined,
        form.title,
        form.slug,
        form.content
      );

      if (duplicateCheck.hasDuplicates) {
        setDuplicates(duplicateCheck.duplicates);
        setPendingSaveAction(actionType || 'save');
        setShowDuplicateModal(true);
        setSaving(false);
        return;
      }
    }

    let statusToSave: 'draft' | 'scheduled' | 'published';
    let successMessage = '';

    if (actionType === 'publish') {
      statusToSave = 'published';
      successMessage = 'Post published successfully!';
    } else if (actionType === 'save') {
      statusToSave = form.status;
      if (form.status === 'published') {
        successMessage = 'Post published successfully!';
      } else if (form.status === 'scheduled') {
        successMessage = `Post scheduled for ${new Date(form.scheduled_publish_at).toLocaleString()}`;
      } else {
        successMessage = 'Draft saved successfully!';
      }
    } else {
      statusToSave = form.status;
    }

    let formattedContent = autoFormatBlogContent(form.content);

    // Optimize images with alt text
    formattedContent = optimizeAllImagesInContent(
      formattedContent,
      form.title,
      form.primary_keyword
    );

    const postData = {
      title: form.title,
      slug: form.slug,
      content: formattedContent,
      excerpt: form.excerpt || generateExcerpt(formattedContent),
      author_name: form.author_name,
      featured_image_url: form.featured_image_url,
      status: statusToSave,
      scheduled_publish_at: statusToSave === 'scheduled' ? form.scheduled_publish_at : null,
      published_at: statusToSave === 'published' ? new Date().toISOString() : null,
      primary_keyword: form.primary_keyword,
      meta_description: form.meta_description,
      schema_markup: form.schema_markup,
      seo_score: form.seo_score
    };

    try {
      let savedPostId = id;

      if (id && id !== 'new') {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select('id')
          .single();

        if (error) throw error;
        if (data) savedPostId = data.id;
      }

      setSaveSuccess(successMessage);
      setForm(f => ({ ...f, status: statusToSave }));

      // Automatically post to Facebook if status is 'published'
      if (statusToSave === 'published' && savedPostId) {
        try {
          const { data: fbSettings } = await supabase
            .from('facebook_settings')
            .select('is_enabled')
            .maybeSingle();

          if (fbSettings?.is_enabled) {
            console.log('Triggering Facebook post for:', form.title);

            const { data, error } = await supabase.functions.invoke('post-to-facebook', {
              body: {
                blogPostId: savedPostId,
                blogPostTitle: form.title,
                blogPostSlug: form.slug,
                forcePost: false
              }
            });

            if (error) {
              console.error('Facebook posting error:', error);
            } else if (data?.success) {
              console.log('Successfully posted to Facebook:', data.facebookPostId);
            }
          }
        } catch (fbError) {
          console.error('Error triggering Facebook post:', fbError);
        }
      }

      // Don't auto-redirect anymore - let user click button when ready
      // setTimeout(() => {
      //   navigate('/blog-management');
      // }, 1500);
    } catch (error: any) {
      console.error('Error saving post:', error);

      // Show detailed error message
      const errorMessage = error?.message || error?.error_description || 'Unknown error occurred';
      const errorDetails = error?.details || '';

      alert(`Failed to save post.\n\nError: ${errorMessage}${errorDetails ? '\n\nDetails: ' + errorDetails : ''}\n\nPlease check the console for more information.`);
    }

    setSaving(false);
  };

  // Duplicate resolution handlers
  const handleOverwritePost = async (duplicateId: string) => {
    try {
      setSaving(true);

      // Create version backup of the existing post
      const versionCreated = await createPostVersion(duplicateId);

      if (!versionCreated) {
        alert('Warning: Failed to create backup version. Proceeding with overwrite anyway.');
      }

      // Now save by overwriting the duplicate
      // Update the form to use the duplicate's ID
      const oldId = id;

      // Temporarily set ID to duplicate ID for update
      window.history.replaceState({}, '', `/blog-management/edit/${duplicateId}`);

      // Perform the save with skip duplicate check
      setShowDuplicateModal(false);

      // Call save with the duplicate ID context
      await performActualSave(pendingSaveAction || 'save', duplicateId);

    } catch (error) {
      console.error('Error overwriting post:', error);
      alert('Failed to overwrite post. Please try again.');
      setSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    try {
      setSaving(true);
      setShowDuplicateModal(false);

      // Modify the slug to make it unique
      const timestamp = Date.now();
      const newSlug = `${form.slug}-${timestamp}`;

      // Update form with new slug
      setForm(f => ({ ...f, slug: newSlug }));

      // Wait for state update, then save
      setTimeout(async () => {
        await handleSave(pendingSaveAction || 'save', true); // Skip duplicate check
      }, 100);

    } catch (error) {
      console.error('Error saving as new:', error);
      alert('Failed to save as new post. Please try again.');
      setSaving(false);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setDuplicates([]);
    setPendingSaveAction(null);
    setSaving(false);
  };

  // **Return Modal Handlers** - Handle "Back to Blog Management" button clicks
  const handleReturnClick = () => {
    // Check if there are unsaved changes
    const hasChanges = form.title || form.content || form.slug !== 'new-post';
    setHasUnsavedChanges(hasChanges);
    setShowReturnModal(true);
  };

  const handleSaveAndReturn = async () => {
    try {
      setIsSavingBeforeReturn(true);

      // Validate form before saving
      if (!validate()) {
        alert('Please fix validation errors before saving.');
        setIsSavingBeforeReturn(false);
        return;
      }

      // Check authentication using AuthContext
      if (!user) {
        alert('You must be logged in to save blog posts. Please log in and try again.');
        setIsSavingBeforeReturn(false);
        return;
      }

      // Prepare post data
      let statusToSave = form.status;
      let formattedContent = autoFormatBlogContent(form.content);
      formattedContent = optimizeAllImagesInContent(
        formattedContent,
        form.title,
        form.primary_keyword
      );

      const postData = {
        title: form.title,
        slug: form.slug,
        content: formattedContent,
        excerpt: form.excerpt || generateExcerpt(formattedContent),
        author_name: form.author_name,
        featured_image_url: form.featured_image_url,
        status: statusToSave,
        scheduled_publish_at: statusToSave === 'scheduled' ? form.scheduled_publish_at : null,
        published_at: statusToSave === 'published' ? new Date().toISOString() : null,
        primary_keyword: form.primary_keyword,
        meta_description: form.meta_description,
        schema_markup: form.schema_markup,
        seo_score: form.seo_score
      };

      // Save the post - handle both new and existing posts
      if (id && id !== 'new') {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) {
          throw new Error(`Failed to save: ${error.message}`);
        }
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select('id')
          .single();

        if (error) {
          throw new Error(`Failed to create post: ${error.message}`);
        }

        // Success - new post created
        console.log('New post created with ID:', data?.id);
      }

      // Success! Close modal and navigate
      setShowReturnModal(false);
      setIsSavingBeforeReturn(false);

      // Use window.location for guaranteed navigation
      window.location.href = '/blog-management';
    } catch (error: any) {
      console.error('Error saving before return:', error);
      alert(`Failed to save your post.\n\nError: ${error.message || 'Unknown error'}\n\nPlease try again.`);
      setIsSavingBeforeReturn(false);
      // Keep modal open so user can fix issues or cancel
    }
  };

  const handleReturnWithoutSaving = () => {
    console.log('Return without saving clicked');
    setShowReturnModal(false);

    // Use window.location for guaranteed navigation
    window.location.href = '/blog-management';
  };

  const handleCancelReturn = () => {
    setShowReturnModal(false);
    setHasUnsavedChanges(false);
    setIsSavingBeforeReturn(false);
  };

  // Helper function to perform the actual save operation
  const performActualSave = async (actionType: 'save' | 'publish', targetId?: string) => {
    const saveId = targetId || id;

    let statusToSave: 'draft' | 'scheduled' | 'published';
    let successMessage = '';

    if (actionType === 'publish') {
      statusToSave = 'published';
      successMessage = 'Post published successfully!';
    } else {
      statusToSave = form.status;
      if (form.status === 'published') {
        successMessage = 'Post published successfully!';
      } else if (form.status === 'scheduled') {
        successMessage = `Post scheduled for ${new Date(form.scheduled_publish_at).toLocaleString()}`;
      } else {
        successMessage = 'Draft saved successfully!';
      }
    }

    let formattedContent = autoFormatBlogContent(form.content);
    formattedContent = optimizeAllImagesInContent(
      formattedContent,
      form.title,
      form.primary_keyword
    );

    const postData = {
      title: form.title,
      slug: form.slug,
      content: formattedContent,
      excerpt: form.excerpt || generateExcerpt(formattedContent),
      author_name: form.author_name,
      featured_image_url: form.featured_image_url,
      status: statusToSave,
      scheduled_publish_at: statusToSave === 'scheduled' ? form.scheduled_publish_at : null,
      published_at: statusToSave === 'published' ? new Date().toISOString() : null,
      primary_keyword: form.primary_keyword,
      meta_description: form.meta_description,
      schema_markup: form.schema_markup,
      seo_score: form.seo_score
    };

    const { error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', saveId);

    if (error) throw error;

    setSaveSuccess(successMessage);
    setForm(f => ({ ...f, status: statusToSave }));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="pt-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <ReturnToDashboardButton
        dashboardPath="/blog-management"
        label="Back to Blog Management"
        onBeforeNavigate={handleReturnClick}
      />

      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {saveSuccess && (
            <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Check className="w-6 h-6 text-green-600" />
                <span className="text-green-800 font-bold text-lg">{saveSuccess}</span>
              </div>
              <p className="text-green-700 text-sm ml-9">
                Click "<strong>Back to Blog Management</strong>" button (bottom-right) to return to the dashboard.
              </p>
            </div>
          )}

          <AIBlogAssistant
            currentContent={{
              title: form.title,
              content: form.content,
              primaryKeyword: form.primary_keyword,
              slug: form.slug
            }}
            onContentUpdate={(updates) => {
              setForm(f => ({
                ...f,
                ...updates
              }));
            }}
            blogPostId={id !== 'new' ? id : undefined}
          />

          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {form.status === 'published' && <span className="font-medium text-green-600">● Published</span>}
                {form.status === 'scheduled' && <span className="font-medium text-blue-600">● Scheduled</span>}
                {form.status === 'draft' && <span className="font-medium text-gray-600">● Draft</span>}
              </div>
              {form.seo_score > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">SEO Score: {form.seo_score}/100</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleOptimizePost}
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                title="Optimize content and review SEO recommendations"
              >
                <Sparkles className="w-5 h-5" />
                Optimize Post
              </button>
              <button
                onClick={() => handleSave('save')}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                title={`Save as ${form.status}`}
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => handleSave('publish')}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Publish Now
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 text-xl font-medium"
                  placeholder="Enter post title..."
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/blog/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="url-slug"
                  />
                </div>
                {errors.slug && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.slug}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Content * (HTML supported)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFormat}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    title="Auto-format content with proper HTML structure"
                  >
                    <Wand2 className="w-4 h-4" />
                    Auto-Format
                  </button>
                </div>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 font-mono text-sm"
                  rows={20}
                  placeholder="Write your content here. HTML tags like <h2>, <p>, <strong>, <ul>, <li> are supported."
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.content}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-500">{form.content.length} characters</p>
                  <p className="text-xs text-gray-400">Tip: Click Auto-Format to apply professional formatting</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Excerpt (Auto-populated on format)
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  rows={3}
                  placeholder="Auto-generated when you click Auto-Format, or write your own..."
                  maxLength={200}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {form.excerpt.length}/200 characters
                  {!form.excerpt && <span className="ml-2 text-blue-600">• Will auto-populate when Auto-Format is clicked</span>}
                </p>
              </div>
            </div>

            {/* SEO Optimization Section - Prominent placement after content */}
            <div id="seo-optimization-section" className="scroll-mt-20">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">SEO Optimization Center</h2>
                    <p className="text-sm text-gray-600">Improve your post's search engine visibility and ranking</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      SEO Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Keyword *
                        </label>
                        <input
                          type="text"
                          value={form.primary_keyword}
                          onChange={(e) => setForm(f => ({ ...f, primary_keyword: e.target.value }))}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                          placeholder="e.g., gutter tiger stripes removal"
                        />
                        <p className="text-xs text-gray-500 mt-1">Main keyword you want to rank for</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description *
                        </label>
                        <textarea
                          value={form.meta_description}
                          onChange={(e) => setForm(f => ({ ...f, meta_description: e.target.value }))}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                          rows={3}
                          placeholder="Brief description for search engines (120-160 chars)"
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {form.meta_description.length}/160 characters
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <KeywordOptimizer
                      content={form.content}
                      primaryKeyword={form.primary_keyword}
                      onKeywordChange={(keyword) => setForm(f => ({ ...f, primary_keyword: keyword }))}
                    />
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <SEOCoach
                    post={{
                      title: form.title,
                      slug: form.slug,
                      content: form.content,
                      excerpt: form.excerpt,
                      meta_description: form.meta_description,
                      featured_image_url: form.featured_image_url,
                      primary_keyword: form.primary_keyword
                    }}
                    onScoreChange={(score) => setForm(f => ({ ...f, seo_score: score }))}
                  />

                  <ReadabilityOptimizer content={form.content} />
                </div>

                {/* Apply Optimization Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleApplyOptimization}
                    type="button"
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    disabled={optimizationApplied}
                  >
                    <CheckCircle className="w-6 h-6" />
                    {optimizationApplied ? 'Optimization Applied ✓' : 'Apply Optimization'}
                  </button>
                </div>

                {optimizationApplied && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                      ✓ Your content has been optimized! Scroll up to review the changes, then Save or Publish your post.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Publishing & Metadata Sidebar - Moved to bottom */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Publishing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    >
                      <option value="draft">Draft - Save for later editing</option>
                      <option value="scheduled">Scheduled - Publish at specific date/time</option>
                      <option value="published">Published - Make live immediately</option>
                    </select>
                  </div>

                  {form.status === 'draft' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        💡 Clicking "Save" will save this as a draft for later editing.
                      </p>
                    </div>
                  )}

                  {form.status === 'published' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700">
                        ✓ Clicking "Save" will publish this post immediately and make it live on your blog.
                      </p>
                    </div>
                  )}

                  {form.status === 'scheduled' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Publish Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={form.scheduled_publish_at}
                          onChange={(e) => setForm(f => ({ ...f, scheduled_publish_at: e.target.value }))}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                        />
                        {errors.scheduled_publish_at && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.scheduled_publish_at}
                          </p>
                        )}
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                          📅 Clicking "Save" will schedule this post to be published automatically at the selected date and time.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Author</h3>
                <input
                  type="text"
                  value={form.author_name}
                  onChange={(e) => setForm(f => ({ ...f, author_name: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  placeholder="Author name..."
                />
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
                <BlogImageUpload
                  currentImageUrl={form.featured_image_url}
                  onImageUploaded={(url) => setForm(f => ({ ...f, featured_image_url: url }))}
                  onImageRemoved={() => setForm(f => ({ ...f, featured_image_url: '' }))}
                />
              </div>

              <SchemaGenerator
                post={{
                  id: id || '',
                  title: form.title,
                  slug: form.slug,
                  excerpt: form.excerpt,
                  content: form.content,
                  author_name: form.author_name,
                  featured_image_url: form.featured_image_url,
                  published_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }}
                onSchemaGenerated={(schema) => setForm(f => ({ ...f, schema_markup: schema }))}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Auto-Format Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Converts headings to &lt;h2&gt; and &lt;h3&gt;</li>
                  <li>• Wraps paragraphs in &lt;p&gt; tags</li>
                  <li>• Creates &lt;ul&gt;&lt;li&gt; lists automatically</li>
                  <li>• Adds &lt;strong&gt; emphasis to key terms</li>
                  <li>• Generates excerpt from content</li>
                  <li>• Optimizes images with alt text</li>
                  <li>• Applied automatically on save</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Resolution Modal */}
      {showDuplicateModal && duplicates.length > 0 && (
        <DuplicateResolutionModal
          duplicates={duplicates}
          onOverwrite={handleOverwritePost}
          onSaveAsNew={handleSaveAsNew}
          onCancel={handleCancelDuplicate}
          isProcessing={saving}
        />
      )}

      {/* Save Confirmation Modal - For "Back to Blog Management" button */}
      <SaveConfirmationModal
        isOpen={showReturnModal}
        onSaveAndReturn={handleSaveAndReturn}
        onReturnWithoutSaving={handleReturnWithoutSaving}
        onCancel={handleCancelReturn}
        isSaving={isSavingBeforeReturn}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
}
