import { TopPage } from '../../services/chartAnalyticsService';

interface TopPagesListProps {
  pages: TopPage[];
  maxHeight?: number;
}

export default function TopPagesList({ pages, maxHeight = 300 }: TopPagesListProps) {
  if (!pages || pages.length === 0) {
    return (
      <div className="text-gray-400 text-sm py-8 text-center">
        No page data available
      </div>
    );
  }

  return (
    <div
      style={{ maxHeight: `${maxHeight}px` }}
      className="overflow-y-auto space-y-1"
    >
      {pages.map((page, index) => (
        <div
          key={`${page.path}-${index}`}
          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm text-gray-200 truncate font-mono">
              {page.path}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-sm font-semibold text-gray-300">
              {page.views.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
