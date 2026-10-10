import { supabase } from '../lib/supabase';

export interface AIGenerationRequest {
  generationType: 'research' | 'outline' | 'draft' | 'seo_optimize' | 'meta_tags' | 'rewrite';
  topic?: string;
  primaryKeyword?: string;
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  targetLength?: number;
  existingContent?: string;
  additionalContext?: string;
  blogPostId?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content: string;
  analysis: {
    seoScore: number;
    readabilityGrade: string;
    fleschScore: number;
    wordCount: number;
    keywordDensity: string;
    sentenceCount: number;
    avgWordsPerSentence: string;
  };
  metadata: {
    generationId: string;
    tokenCount: number;
    generationTimeMs: number;
    promptTemplateVersion: number;
  };
  error?: string;
}

export class AIContentService {
  private static async callEdgeFunction(
    functionName: string,
    payload: any
  ): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('You must be logged in to use AI features');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI generation failed');
    }

    return response.json();
  }

  static async generateContent(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    return this.callEdgeFunction('generate-blog-content', request);
  }

  static async researchTopic(
    topic: string,
    primaryKeyword: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      generationType: 'research',
      topic,
      primaryKeyword,
    });
  }

  static async createOutline(
    topic: string,
    primaryKeyword: string,
    tone?: string,
    targetLength?: number
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      generationType: 'outline',
      topic,
      primaryKeyword,
      tone: tone as any,
      targetLength,
    });
  }

  static async generateDraft(
    outline: string,
    primaryKeyword: string,
    tone?: string,
    targetLength?: number,
    blogPostId?: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      generationType: 'draft',
      existingContent: outline,
      primaryKeyword,
      tone: tone as any,
      targetLength,
      blogPostId,
    });
  }

  static async optimizeForSEO(
    content: string,
    primaryKeyword: string,
    blogPostId?: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      generationType: 'seo_optimize',
      existingContent: content,
      primaryKeyword,
      blogPostId,
    });
  }

  static async generateMetaTags(
    title: string,
    contentPreview: string,
    primaryKeyword: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      generationType: 'meta_tags',
      topic: title,
      existingContent: contentPreview,
      primaryKeyword,
    });
  }

  static async rewriteContent(
    content: string,
    primaryKeyword: string,
    tone?: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      generationType: 'rewrite',
      existingContent: content,
      primaryKeyword,
      tone: tone as any,
    });
  }

  // Fetch generation history
  static async getGenerationHistory(blogPostId?: string) {
    let query = supabase
      .from('ai_content_generations')
      .select('*')
      .order('created_at', { ascending: false });

    if (blogPostId) {
      query = query.eq('blog_post_id', blogPostId);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data;
  }

  // Accept a generated version
  static async acceptGeneration(generationId: string) {
    const { error } = await supabase
      .from('ai_content_generations')
      .update({ accepted: true })
      .eq('id', generationId);

    if (error) throw error;
  }
}
