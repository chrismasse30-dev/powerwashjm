export interface ClarityMetrics {
  totalSessions: number;
  activeUsers: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  deadClicks: number;
  rageClicks: number;
  excessiveScrolling: number;
  quickBacks: number;
}

export interface ClarityTopPage {
  url: string;
  sessions: number;
  avgTime: number;
  deadClicks: number;
  rageClicks: number;
}

export interface ClarityInsight {
  type: 'dead-click' | 'rage-click' | 'excessive-scroll' | 'quick-back';
  page: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}

class ClarityService {
  private projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

  async getMetrics(): Promise<ClarityMetrics> {
    if (!this.projectId || this.projectId === 'your_clarity_project_id_here') {
      return this.getMockMetrics();
    }

    return this.getMockMetrics();
  }

  async getTopPages(): Promise<ClarityTopPage[]> {
    if (!this.projectId || this.projectId === 'your_clarity_project_id_here') {
      return this.getMockTopPages();
    }

    return this.getMockTopPages();
  }

  async getInsights(): Promise<ClarityInsight[]> {
    if (!this.projectId || this.projectId === 'your_clarity_project_id_here') {
      return this.getMockInsights();
    }

    return this.getMockInsights();
  }

  getClarityDashboardUrl(): string {
    if (!this.projectId || this.projectId === 'your_clarity_project_id_here') {
      return 'https://clarity.microsoft.com/';
    }
    return `https://clarity.microsoft.com/projects/view/${this.projectId}/dashboard`;
  }

  getHeatmapUrl(page: string): string {
    if (!this.projectId || this.projectId === 'your_clarity_project_id_here') {
      return 'https://clarity.microsoft.com/';
    }
    return `https://clarity.microsoft.com/projects/view/${this.projectId}/heatmaps?url=${encodeURIComponent(page)}`;
  }

  getRecordingsUrl(): string {
    if (!this.projectId || this.projectId === 'your_clarity_project_id_here') {
      return 'https://clarity.microsoft.com/';
    }
    return `https://clarity.microsoft.com/projects/view/${this.projectId}/recordings`;
  }

  private getMockMetrics(): ClarityMetrics {
    return {
      totalSessions: 1547,
      activeUsers: 1289,
      avgSessionDuration: 245,
      pagesPerSession: 3.4,
      deadClicks: 87,
      rageClicks: 23,
      excessiveScrolling: 145,
      quickBacks: 56,
    };
  }

  private getMockTopPages(): ClarityTopPage[] {
    return [
      {
        url: '/',
        sessions: 456,
        avgTime: 178,
        deadClicks: 12,
        rageClicks: 3,
      },
      {
        url: '/holiday-lights',
        sessions: 312,
        avgTime: 245,
        deadClicks: 8,
        rageClicks: 2,
      },
      {
        url: '/house-washing',
        sessions: 287,
        avgTime: 198,
        deadClicks: 15,
        rageClicks: 5,
      },
      {
        url: '/financing',
        sessions: 165,
        avgTime: 223,
        deadClicks: 6,
        rageClicks: 1,
      },
      {
        url: '/commercial',
        sessions: 143,
        avgTime: 189,
        deadClicks: 9,
        rageClicks: 2,
      },
    ];
  }

  private getMockInsights(): ClarityInsight[] {
    return [
      {
        type: 'dead-click',
        page: '/house-washing',
        count: 15,
        severity: 'high',
      },
      {
        type: 'dead-click',
        page: '/',
        count: 12,
        severity: 'medium',
      },
      {
        type: 'rage-click',
        page: '/house-washing',
        count: 5,
        severity: 'high',
      },
      {
        type: 'excessive-scroll',
        page: '/holiday-lights',
        count: 34,
        severity: 'medium',
      },
      {
        type: 'quick-back',
        page: '/commercial',
        count: 18,
        severity: 'medium',
      },
    ];
  }
}

export const clarityService = new ClarityService();
