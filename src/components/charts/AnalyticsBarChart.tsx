import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../services/chartAnalyticsService';

interface AnalyticsBarChartProps {
  data: ChartDataPoint[];
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

export default function AnalyticsBarChart({
  data,
  color = '#3b82f6',
  height = 300,
  formatValue,
}: AnalyticsBarChartProps) {
  const formattedData = data.map(point => ({
    name: point.date,
    value: point.value,
  }));

  const maxValue = Math.max(...data.map(d => d.value));
  const yAxisMax = Math.ceil(maxValue * 1.1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const displayValue = formatValue ? formatValue(value) : value;

      return (
        <div
          style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
          }}
        >
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
            {displayValue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={formattedData}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="name"
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
          tickLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
          tickLine={false}
          domain={[0, yAxisMax]}
          tickFormatter={formatValue}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
