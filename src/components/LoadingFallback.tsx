import { Loader } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingFallback({
  message = 'Loading...',
  fullScreen = true
}: LoadingFallbackProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center bg-white"
    : "flex items-center justify-center py-20 bg-white";

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label="Content is loading">
      <div className="text-center">
        <Loader
          className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin"
          aria-hidden="true"
        />
        <p className="text-gray-600 text-lg font-medium">{message}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
