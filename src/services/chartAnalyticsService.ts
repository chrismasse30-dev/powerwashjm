export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export type DateRangeFilter = 'day' | 'week' | 'month';

class ChartAnalyticsService {
  private mockMode = false;
  private baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-ga4-data`;
  private headers = {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getDateRange(filter: DateRangeFilter): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (filter) {
      case 'day':
        start.setDate(end.getDate() - 1);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setDate(end.getDate() - 30);
        break;
    }

    return { start, end };
  }

  async getUniqueVisitors(filter: DateRangeFilter): Promise<ChartDataPoint[]> {
    if (this.mockMode) {
      return this.generateMockData(filter, 50, 380);
    }

    try {
      const { start, end } = this.getDateRange(filter);
      const startDate = this.formatDate(start);
      const endDate = this.formatDate(end);

      const response = await fetch(
        `${this.baseUrl}?type=trend&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch unique visitors');

      const data = await response.json();
      const chartData: ChartDataPoint[] = [];

      if (data.rows) {
        data.rows.forEach((row: any) => {
          const rawDate = row.dimensionValues[0]?.value || '';
          const formattedDate = this.formatChartDate(rawDate, filter);
          chartData.push({
            date: formattedDate,
            value: parseInt(row.metricValues[0]?.value || '0'),
          });
        });
      }

      return chartData;
    } catch (error) {
      console.error('Error fetching unique visitors:', error);
      return this.generateMockData(filter, 50, 380);
    }
  }

  async getPageviews(filter: DateRangeFilter): Promise<ChartDataPoint[]> {
    if (this.mockMode) {
      return this.generateMockData(filter, 100, 800);
    }

    try {
      const { start, end } = this.getDateRange(filter);
      const startDate = this.formatDate(start);
      const endDate = this.formatDate(end);

      const response = await fetch(
        `${this.baseUrl}?type=pageviews&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch pageviews');

      const data = await response.json();
      const chartData: ChartDataPoint[] = [];

      if (data.rows) {
        data.rows.forEach((row: any) => {
          const rawDate = row.dimensionValues[0]?.value || '';
          const formattedDate = this.formatChartDate(rawDate, filter);
          chartData.push({
            date: formattedDate,
            value: parseInt(row.metricValues[1]?.value || '0'),
          });
        });
      }

      return chartData;
    } catch (error) {
      console.error('Error fetching pageviews:', error);
      return this.generateMockData(filter, 100, 800);
    }
  }

  async getBandwidth(filter: DateRangeFilter): Promise<ChartDataPoint[]> {
    if (this.mockMode) {
      return this.generateMockBandwidth(filter);
    }

    // Bandwidth data would come from Netlify or server logs
    // For now, we'll use mock data as GA4 doesn't track bandwidth
    return this.generateMockBandwidth(filter);
  }

  async getTopPages(filter: DateRangeFilter): Promise<TopPage[]> {
    if (this.mockMode) {
      return [
        { path: '/', views: 1056 },
        { path: '/wp-admin/setup-config.php', views: 297 },
        { path: '/wordpress/wp-admin/setup-config.php', views: 295 },
      ];
    }

    try {
      const { start, end } = this.getDateRange(filter);
      const startDate = this.formatDate(start);
      const endDate = this.formatDate(end);

      const response = await fetch(
        `${this.baseUrl}?type=pages&startDate=${startDate}&endDate=${endDate}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Failed to fetch top pages');

      const data = await response.json();
      const topPages: TopPage[] = [];

      if (data.rows) {
        data.rows.slice(0, 10).forEach((row: any) => {
          topPages.push({
            path: row.dimensionValues[0]?.value || 'Unknown',
            views: parseInt(row.metricValues[0]?.value || '0'),
          });
        });
      }

      return topPages;
    } catch (error) {
      console.error('Error fetching top pages:', error);
      return [
        { path: '/', views: 0 },
        { path: '/house-washing/', views: 0 },
        { path: '/holiday-lights/', views: 0 },
      ];
    }
  }

  private formatChartDate(dateString: string, filter: DateRangeFilter): string {
    // dateString format from GA4: YYYYMMDD
    if (dateString.length === 8) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const date = new Date(`${year}-${month}-${day}`);

      if (filter === 'day') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
    return dateString;
  }

  private generateMockData(filter: DateRangeFilter, min: number, max: number): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    let points = 0;

    switch (filter) {
      case 'day':
        points = 24; // Hourly data
        break;
      case 'week':
        points = 7; // Daily data
        break;
      case 'month':
        points = 30; // Daily data
        break;
    }

    const now = new Date();

    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now);

      if (filter === 'day') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      // Generate smooth curve similar to Bolt's analytics
      const baseValue = (min + max) / 2;
      const amplitude = (max - min) / 2;
      const variance = Math.sin((i / points) * Math.PI * 2) * amplitude;
      const randomness = (Math.random() - 0.5) * (amplitude * 0.3);

      let dateLabel = '';
      if (filter === 'day') {
        dateLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      data.push({
        date: dateLabel,
        value: Math.max(min, Math.round(baseValue + variance + randomness)),
      });
    }

    return data;
  }

  private generateMockBandwidth(filter: DateRangeFilter): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    let points = 0;

    switch (filter) {
      case 'day':
        points = 24;
        break;
      case 'week':
        points = 7;
        break;
      case 'month':
        points = 30;
        break;
    }

    const now = new Date();

    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now);

      if (filter === 'day') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      // Generate bandwidth data in MB (random bars like in the screenshot)
      const baseValue = 600; // MB
      const randomValue = Math.random() * 500 + 300;

      let dateLabel = '';
      if (filter === 'day') {
        dateLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      data.push({
        date: dateLabel,
        value: Math.round(randomValue),
      });
    }

    return data;
  }

  formatBandwidth(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

export const chartAnalyticsService = new ChartAnalyticsService();
