export interface GAMetrics {
  activeUsers: number;
  totalEvents: number;
  keyEvents: number;
  activeUsersChange: number;
  totalEventsChange: number;
  keyEventsChange: number;
}

export interface ActiveUsersTrend {
  date: string;
  users: number;
}

export interface RealTimeMetrics {
  activeUsersNow: number;
  minuteByMinute: Array<{ minute: string; users: number }>;
}

export interface PagePerformance {
  pageTitle: string;
  views: number;
  uniqueViews: number;
  avgTime: number;
  bounceRate: number;
}

export interface GeographicData {
  country: string;
  users: number;
  percentage: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

export interface BoltPlatformMetrics {
  mrr: number;
  mrrChange: number;
  clv: number;
  churnRate: number;
  retentionRate: number;
  arpu: number;
  dauMau: { dau: number; mau: number };
  uptime: number;
  apiResponseTime: number;
  errorRate: number;
  supportTickets: number;
  avgResolutionTime: number;
}

export interface MarketingMetrics {
  roi: Record<string, number>;
  cpa: number;
  cpaChange: number;
  conversionFunnel: Array<{ stage: string; count: number; rate: number }>;
  emailMetrics: { openRate: number; ctr: number; campaigns: number };
  contentMetrics: Array<{ title: string; engagement: number; views: number }>;
  seoMetrics: {
    keywordRankings: Array<{ keyword: string; position: number; change: number }>;
    organicTrafficGrowth: number;
    backlinks: number;
    backlinkQuality: number;
  };
  customerJourney: {
    avgTimeToConversion: number;
    multiTouchAttribution: Array<{ channel: string; contribution: number }>;
    acquisitionCost: Record<string, number>;
  };
}

class AnalyticsService {
  private mockMode = false;

  private getSupabaseUrl(): string {
    return import.meta.env.VITE_SUPABASE_URL;
  }

  private getAnonKey(): string {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  private get baseUrl(): string {
    return `${this.getSupabaseUrl()}/functions/v1/fetch-ga4-data`;
  }

  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.getAnonKey()}`,
      'Content-Type': 'application/json',
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async getExecutiveKPIs(dateRange: { start: Date; end: Date }): Promise<GAMetrics> {
    if (this.mockMode) {
      return {
        activeUsers: 12547,
        totalEvents: 48923,
        keyEvents: 342,
        activeUsersChange: 12.5,
        totalEventsChange: 8.3,
        keyEventsChange: 15.7,
      };
    }

    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const response = await fetch(
        `${this.baseUrl}?type=kpis&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch KPIs');

      const data = await response.json();

      let activeUsers = 0;
      let totalEvents = 0;
      let keyEvents = 0;

      if (data.rows && data.rows.length > 0) {
        data.rows.forEach((row: any) => {
          activeUsers += parseInt(row.metricValues[0]?.value || '0');
          totalEvents += parseInt(row.metricValues[2]?.value || '0');
          keyEvents += parseInt(row.metricValues[3]?.value || '0');
        });
      }

      return {
        activeUsers,
        totalEvents,
        keyEvents,
        activeUsersChange: 0,
        totalEventsChange: 0,
        keyEventsChange: 0,
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return {
        activeUsers: 0,
        totalEvents: 0,
        keyEvents: 0,
        activeUsersChange: 0,
        totalEventsChange: 0,
        keyEventsChange: 0,
      };
    }
  }

  async getActiveUsersTrend(dateRange: { start: Date; end: Date }): Promise<ActiveUsersTrend[]> {
    if (this.mockMode) {
      const days = 7;
      const data: ActiveUsersTrend[] = [];
      const baseUsers = 1500;

      for (let i = 0; i < days; i++) {
        const date = new Date(dateRange.start);
        date.setDate(date.getDate() + i);
        const variance = Math.sin(i / 2) * 300 + Math.random() * 200;
        data.push({
          date: date.toISOString().split('T')[0],
          users: Math.round(baseUsers + variance),
        });
      }

      return data;
    }

    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const response = await fetch(
        `${this.baseUrl}?type=trend&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch trend data');

      const data = await response.json();
      const trend: ActiveUsersTrend[] = [];

      if (data.rows) {
        data.rows.forEach((row: any) => {
          const rawDate = row.dimensionValues[0]?.value || '';
          let formattedDate = rawDate;

          if (rawDate.length === 8) {
            const year = rawDate.substring(0, 4);
            const month = rawDate.substring(4, 6);
            const day = rawDate.substring(6, 8);
            formattedDate = `${year}-${month}-${day}`;
          }

          trend.push({
            date: formattedDate,
            users: parseInt(row.metricValues[0]?.value || '0'),
          });
        });
      }

      return trend;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return [];
    }
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    if (this.mockMode) {
      const minuteByMinute = [];
      const now = new Date();

      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        minuteByMinute.push({
          minute: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          users: Math.round(30 + Math.random() * 20),
        });
      }

      return {
        activeUsersNow: Math.round(35 + Math.random() * 15),
        minuteByMinute,
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?type=realtime`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch real-time data');

      const data = await response.json();
      const dataMap = new Map<number, number>();
      let activeUsersNow = 0;

      if (data.rows) {
        data.rows.forEach((row: any) => {
          const minutesAgo = parseInt(row.dimensionValues[0]?.value || '0');
          const users = parseInt(row.metricValues[0]?.value || '0');
          dataMap.set(minutesAgo, users);

          if (minutesAgo === 0 || minutesAgo === 1) {
            activeUsersNow = Math.max(activeUsersNow, users);
          }
        });
      }

      const minuteByMinute: Array<{ minute: string; users: number }> = [];
      for (let i = 29; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000);
        minuteByMinute.push({
          minute: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          users: dataMap.get(i) || 0,
        });
      }

      return {
        activeUsersNow,
        minuteByMinute,
      };
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      return {
        activeUsersNow: 0,
        minuteByMinute: [],
      };
    }
  }

  async getTopPages(dateRange: { start: Date; end: Date }): Promise<PagePerformance[]> {
    if (this.mockMode) {
      return [
        { pageTitle: 'House Washing Services', views: 3245, uniqueViews: 2876, avgTime: 142, bounceRate: 34.5 },
        { pageTitle: 'Holiday Lights Installation', views: 2983, uniqueViews: 2654, avgTime: 198, bounceRate: 28.3 },
        { pageTitle: 'Commercial Services', views: 2156, uniqueViews: 1943, avgTime: 167, bounceRate: 31.2 },
        { pageTitle: 'Get a Quote', views: 1876, uniqueViews: 1652, avgTime: 89, bounceRate: 45.6 },
        { pageTitle: 'Roof Cleaning', views: 1654, uniqueViews: 1432, avgTime: 134, bounceRate: 36.8 },
        { pageTitle: 'Deck Cleaning', views: 1432, uniqueViews: 1298, avgTime: 128, bounceRate: 38.4 },
        { pageTitle: 'Concrete Cleaning', views: 1298, uniqueViews: 1154, avgTime: 115, bounceRate: 40.2 },
        { pageTitle: 'Financing Options', views: 987, uniqueViews: 876, avgTime: 156, bounceRate: 33.7 },
        { pageTitle: 'FAQ', views: 865, uniqueViews: 743, avgTime: 203, bounceRate: 29.8 },
        { pageTitle: 'Customer Portal', views: 654, uniqueViews: 598, avgTime: 267, bounceRate: 22.4 },
      ];
    }

    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const response = await fetch(
        `${this.baseUrl}?type=pages&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch pages data');

      const data = await response.json();
      const pages: PagePerformance[] = [];

      if (data.rows) {
        data.rows.forEach((row: any) => {
          pages.push({
            pageTitle: row.dimensionValues[0]?.value || 'Unknown',
            views: parseInt(row.metricValues[0]?.value || '0'),
            uniqueViews: parseInt(row.metricValues[1]?.value || '0'),
            avgTime: Math.round(parseFloat(row.metricValues[2]?.value || '0')),
            bounceRate: Math.round(parseFloat(row.metricValues[3]?.value || '0') * 100),
          });
        });
      }

      return pages;
    } catch (error) {
      console.error('Error fetching pages data:', error);
      return [];
    }
  }

  async getGeographicData(dateRange: { start: Date; end: Date }): Promise<GeographicData[]> {
    if (this.mockMode) {
      const total = 12547;
      return [
        { country: 'United States', users: 11234, percentage: 89.5 },
        { country: 'Canada', users: 543, percentage: 4.3 },
        { country: 'United Kingdom', users: 287, percentage: 2.3 },
        { country: 'Australia', users: 165, percentage: 1.3 },
        { country: 'Germany', users: 98, percentage: 0.8 },
        { country: 'France', users: 76, percentage: 0.6 },
        { country: 'Japan', users: 54, percentage: 0.4 },
        { country: 'Brazil', users: 43, percentage: 0.3 },
        { country: 'India', users: 32, percentage: 0.3 },
        { country: 'Other', users: 15, percentage: 0.1 },
      ];
    }

    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const response = await fetch(
        `${this.baseUrl}?type=geo&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch geographic data');

      const data = await response.json();
      const geoData: GeographicData[] = [];
      let totalUsers = 0;

      if (data.rows) {
        data.rows.forEach((row: any) => {
          totalUsers += parseInt(row.metricValues[0]?.value || '0');
        });

        data.rows.forEach((row: any) => {
          const users = parseInt(row.metricValues[0]?.value || '0');
          geoData.push({
            country: row.dimensionValues[0]?.value || 'Unknown',
            users,
            percentage: totalUsers > 0 ? Math.round((users / totalUsers) * 1000) / 10 : 0,
          });
        });
      }

      return geoData;
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      return [];
    }
  }

  async getTrafficSources(dateRange: { start: Date; end: Date }): Promise<TrafficSource[]> {
    if (this.mockMode) {
      return [
        { source: 'Organic Search', sessions: 5432, percentage: 43.3 },
        { source: 'Direct', sessions: 3456, percentage: 27.5 },
        { source: 'Social Media', sessions: 1876, percentage: 15.0 },
        { source: 'Referral', sessions: 987, percentage: 7.9 },
        { source: 'Email', sessions: 543, percentage: 4.3 },
        { source: 'Paid Search', sessions: 253, percentage: 2.0 },
      ];
    }

    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const response = await fetch(
        `${this.baseUrl}?type=traffic&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch traffic data');

      const data = await response.json();
      const trafficSources: TrafficSource[] = [];
      let totalSessions = 0;

      if (data.rows) {
        data.rows.forEach((row: any) => {
          totalSessions += parseInt(row.metricValues[0]?.value || '0');
        });

        data.rows.forEach((row: any) => {
          const sessions = parseInt(row.metricValues[0]?.value || '0');
          trafficSources.push({
            source: row.dimensionValues[0]?.value || 'Unknown',
            sessions,
            percentage: totalSessions > 0 ? Math.round((sessions / totalSessions) * 1000) / 10 : 0,
          });
        });
      }

      return trafficSources;
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      return [];
    }
  }

  async getBoltPlatformMetrics(): Promise<BoltPlatformMetrics> {
    if (this.mockMode) {
      return {
        mrr: 45678,
        mrrChange: 8.3,
        clv: 12450,
        churnRate: 2.3,
        retentionRate: 94.7,
        arpu: 89.50,
        dauMau: { dau: 3245, mau: 12547 },
        uptime: 99.97,
        apiResponseTime: 145,
        errorRate: 0.12,
        supportTickets: 87,
        avgResolutionTime: 4.5,
      };
    }

    return {
      mrr: 0,
      mrrChange: 0,
      clv: 0,
      churnRate: 0,
      retentionRate: 0,
      arpu: 0,
      dauMau: { dau: 0, mau: 0 },
      uptime: 0,
      apiResponseTime: 0,
      errorRate: 0,
      supportTickets: 0,
      avgResolutionTime: 0,
    };
  }

  async getMarketingMetrics(): Promise<MarketingMetrics> {
    if (this.mockMode) {
      return {
        roi: {
          'Google Ads': 3.45,
          'Facebook Ads': 2.87,
          'Email Marketing': 4.23,
          'Content Marketing': 5.67,
        },
        cpa: 42.50,
        cpaChange: -5.3,
        conversionFunnel: [
          { stage: 'Visitors', count: 12547, rate: 100 },
          { stage: 'Engaged', count: 8934, rate: 71.2 },
          { stage: 'Leads', count: 2156, rate: 17.2 },
          { stage: 'Qualified', count: 876, rate: 7.0 },
          { stage: 'Customers', count: 342, rate: 2.7 },
        ],
        emailMetrics: {
          openRate: 24.5,
          ctr: 3.8,
          campaigns: 12,
        },
        contentMetrics: [
          { title: 'Ultimate Guide to House Washing', engagement: 1234, views: 4567 },
          { title: 'Holiday Lights Installation Tips', engagement: 987, views: 3456 },
          { title: '5 Benefits of Roof Cleaning', engagement: 765, views: 2345 },
        ],
        seoMetrics: {
          keywordRankings: [
            { keyword: 'power washing near me', position: 3, change: 2 },
            { keyword: 'house washing services', position: 5, change: 1 },
            { keyword: 'holiday lights installation', position: 7, change: -1 },
          ],
          organicTrafficGrowth: 15.3,
          backlinks: 2456,
          backlinkQuality: 78,
        },
        customerJourney: {
          avgTimeToConversion: 7.3,
          multiTouchAttribution: [
            { channel: 'Organic Search', contribution: 35 },
            { channel: 'Social Media', contribution: 25 },
            { channel: 'Email', contribution: 20 },
            { channel: 'Direct', contribution: 15 },
            { channel: 'Referral', contribution: 5 },
          ],
          acquisitionCost: {
            'Organic Search': 28.50,
            'Paid Search': 65.30,
            'Social Media': 42.80,
            'Email Marketing': 18.90,
          },
        },
      };
    }

    return {
      roi: {},
      cpa: 0,
      cpaChange: 0,
      conversionFunnel: [],
      emailMetrics: { openRate: 0, ctr: 0, campaigns: 0 },
      contentMetrics: [],
      seoMetrics: {
        keywordRankings: [],
        organicTrafficGrowth: 0,
        backlinks: 0,
        backlinkQuality: 0,
      },
      customerJourney: {
        avgTimeToConversion: 0,
        multiTouchAttribution: [],
        acquisitionCost: {},
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
