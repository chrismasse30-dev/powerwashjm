import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Top bar loading indicator for route transitions
 *
 * Shows a subtle progress bar at the top during navigation
 * instead of a full-screen spinner for better UX
 */
export function TopBarLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);

    // Hide loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    // Control the top bar loader element
    const topBarLoader = document.getElementById('top-bar-loader');
    if (topBarLoader) {
      if (isLoading) {
        topBarLoader.classList.add('loading');
      } else {
        topBarLoader.classList.remove('loading');
      }
    }
  }, [isLoading]);

  return null; // No render needed, controls DOM element directly
}
