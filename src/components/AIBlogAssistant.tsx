import { useState } from 'react';
import { Sparkles, Wand2, TrendingUp, FileText, Search, Loader } from 'lucide-react';
import { AIContentService } from '../services/aiContentService';

interface AIBlogAssistantProps {
  currentContent: {
    title: string;
    content: string;
    primaryKeyword: string;
    slug: string;
  };
  onContentUpdate: (updates: {
    title?: string;
    content?: string;
    primaryKeyword?: string;
    slug?: string;
    meta_description?: string;
  }) => void;
  blogPostId?: string;
}

type AIStep = 'idle' | 'research' | 'outline' | 'draft' | 'optimize';

export default function AIBlogAssistant({
  currentContent,
  onContentUpdate,
  blogPostId
}: AIBlogAssistantProps) {
  const [currentStep, setCurrentStep] = useState<AIStep>('idle');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [seoScore, setSeoScore] = useState(0);
  const [readabilityGrade, setReadabilityGrade] = useState('');

  // AI Wizard Settings
  const [topic, setTopic] = useState(currentContent.title || '');
  const [keyword, setKeyword] = useState(currentContent.primaryKeyword || '');
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical' | 'friendly'>('professional');
  const [targetLength, setTargetLength] = useState(1500);

  const runFullAIWorkflow = async () => {
    if (!topic || !keyword) {
      alert('Please enter a topic and primary keyword');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Research
      setCurrentStep('research');
      setProgress('🔍 Researching topic and gathering insights...');
      await AIContentService.researchTopic(topic, keyword);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Create Outline
      setCurrentStep('outline');
      setProgress('📋 Creating detailed blog outline...');
      const outlineResult = await AIContentService.createOutline(
        topic,
        keyword,
        tone,
        targetLength
      );
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Generate Draft
      setCurrentStep('draft');
      setProgress('✍️ Writing complete blog post...');
      const draftResult = await AIContentService.generateDraft(
        outlineResult.content,
        keyword,
        tone,
        targetLength,
        blogPostId
      );
      setSeoScore(draftResult.analysis.seoScore);
      setReadabilityGrade(draftResult.analysis.readabilityGrade);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: SEO Optimization
      setCurrentStep('optimize');
      setProgress('🚀 Optimizing for SEO...');
      const optimizedResult = await AIContentService.optimizeForSEO(
        draftResult.content,
        keyword,
        blogPostId
      );

      // Generate meta tags
      const metaResult = await AIContentService.generateMetaTags(
        topic,
        optimizedResult.content.substring(0, 500),
        keyword
      );

      let metaTags;
      try {
        metaTags = JSON.parse(metaResult.content);
      } catch {
        metaTags = { slug: topic.toLowerCase().replace(/\s+/g, '-') };
      }

      setSeoScore(optimizedResult.analysis.seoScore);
      setReadabilityGrade(optimizedResult.analysis.readabilityGrade);

      // Update form with all generated content
      onContentUpdate({
        title: metaTags.title || topic,
        content: optimizedResult.content,
        primaryKeyword: keyword,
        slug: metaTags.slug || topic.toLowerCase().replace(/\s+/g, '-'),
        meta_description: metaTags.metaDescription || ''
      });

      setProgress(`✅ Complete! SEO Score: ${optimizedResult.analysis.seoScore}/100 | Readability: ${optimizedResult.analysis.readabilityGrade}`);
      setCurrentStep('idle');

      alert(`🎉 AI blog post generated successfully!\n\nSEO Score: ${optimizedResult.analysis.seoScore}/100\nReadability Grade: ${optimizedResult.analysis.readabilityGrade}\n\nScroll down to review and edit your content.`);

    } catch (error: any) {
      console.error('AI workflow error:', error);

      // Provide helpful error message for authentication issues
      if (error.message.includes('logged in') || error.message.includes('Unauthorized')) {
        alert('🔒 Authentication Required\n\nYou must be logged in to use AI features.\n\nPlease log in using:\nEmail: sales@powerwashjm.com\nPassword: REMOVED_SEE_ADMIN');
      } else {
        alert(`AI generation failed: ${error.message}`);
      }
      setCurrentStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const quickOptimize = async () => {
    if (!currentContent.content || !currentContent.primaryKeyword) {
      alert('Please add content and a primary keyword first');
      return;
    }

    try {
      setLoading(true);
      setProgress('🚀 Optimizing your content for SEO...');

      // Step 1: Optimize content
      const result = await AIContentService.optimizeForSEO(
        currentContent.content,
        currentContent.primaryKeyword,
        blogPostId
      );

      setSeoScore(result.analysis.seoScore);
      setReadabilityGrade(result.analysis.readabilityGrade);

      // Step 2: Generate/update meta tags if missing
      setProgress('📝 Generating meta tags...');
      const metaResult = await AIContentService.generateMetaTags(
        currentContent.title || 'Blog Post',
        result.content.substring(0, 500),
        currentContent.primaryKeyword
      );

      let metaTags;
      try {
        metaTags = JSON.parse(metaResult.content);
      } catch {
        metaTags = {};
      }

      // Update all fields for comprehensive optimization
      onContentUpdate({
        content: result.content,
        meta_description: metaTags.metaDescription || currentContent.meta_description,
        slug: metaTags.slug || currentContent.slug
      });

      setProgress('✅ Optimization complete!');

      alert(`✅ Content optimized successfully!\n\n📊 AI Generation Score: ${result.analysis.seoScore}/100\n📖 Readability: ${result.analysis.readabilityGrade}\n\n💡 Both your content quality and SEO scores should now be 75+. Featured images and links are automatically added when you publish!`);
    } catch (error: any) {
      // Provide helpful error message for authentication issues
      if (error.message.includes('logged in') || error.message.includes('Unauthorized')) {
        alert('🔒 Authentication Required\n\nYou must be logged in to use AI features.\n\nPlease log in using:\nEmail: sales@powerwashjm.com\nPassword: REMOVED_SEE_ADMIN');
      } else {
        alert(`Optimization failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl shadow-2xl p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Blog Assistant</h2>
          <p className="text-sm text-gray-600">Generate complete blog posts with 80+ SEO scores in minutes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Content Generation
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="e.g., Benefits of Pressure Washing for Home Maintenance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Keyword *
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="e.g., pressure washing benefits"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Length
            </label>
            <select
              value={targetLength}
              onChange={(e) => setTargetLength(Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="800">Short (800 words)</option>
              <option value="1200">Medium (1200 words)</option>
              <option value="1500">Long (1500 words)</option>
              <option value="2000">Very Long (2000+ words)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={runFullAIWorkflow}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6" />
                Generate Complete Blog Post
              </>
            )}
          </button>

          <button
            onClick={quickOptimize}
            disabled={loading || !currentContent.content}
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-5 h-5" />
            Quick SEO Optimize
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader className="w-6 h-6 text-purple-600 animate-spin" />
            <h4 className="font-semibold text-gray-900">AI Processing...</h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'research' || currentStep !== 'idle' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {currentStep === 'research' ? <Loader className="w-4 h-4 animate-spin" /> : '1'}
              </div>
              <span className={currentStep === 'research' ? 'font-semibold' : ''}>Research Topic</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'outline' ? 'bg-purple-600 text-white' : currentStep !== 'idle' && currentStep !== 'research' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {currentStep === 'outline' ? <Loader className="w-4 h-4 animate-spin" /> : '2'}
              </div>
              <span className={currentStep === 'outline' ? 'font-semibold' : ''}>Create Outline</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'draft' ? 'bg-purple-600 text-white' : currentStep === 'optimize' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {currentStep === 'draft' ? <Loader className="w-4 h-4 animate-spin" /> : '3'}
              </div>
              <span className={currentStep === 'draft' ? 'font-semibold' : ''}>Generate Draft</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'optimize' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                {currentStep === 'optimize' ? <Loader className="w-4 h-4 animate-spin" /> : '4'}
              </div>
              <span className={currentStep === 'optimize' ? 'font-semibold' : ''}>SEO Optimization</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-900">{progress}</p>
          </div>
        </div>
      )}

      {seoScore > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-lg text-gray-900 mb-2">📊 Generation Results</h4>
          <p className="text-xs text-gray-600 mb-4">AI Content Quality Score (based on generated text only)</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700 mb-1">SEO Score</div>
              <div className="text-3xl font-bold text-green-900">{seoScore}/100</div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">Readability Grade</div>
              <div className="text-3xl font-bold text-blue-900">{readabilityGrade}</div>
            </div>
          </div>

          {seoScore >= 80 && readabilityGrade.includes('B+') ? (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Excellent! Your content meets all quality standards.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Content needs improvement. Run "Quick SEO Optimize" to boost scores.
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Note:</strong> The SEO Coach panel shows a comprehensive score including content, meta descriptions, keywords, and technical SEO. Featured images and links are auto-applied when you publish, so they won't affect your editing score.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Features
        </h4>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600" />
            <span>Topic Research & Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Smart Outline Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-600" />
            <span>Full Content Creation</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>SEO Optimization (80+ scores)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
