import { Info } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  subtitle?: string;
  tooltip?: string;
  children: ReactNode;
  loading?: boolean;
}

export default function MetricCard({
  title,
  subtitle,
  tooltip,
  children,
  loading = false,
}: MetricCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {tooltip && (
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 top-6 w-64 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
