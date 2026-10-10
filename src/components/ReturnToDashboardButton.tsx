import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ReturnToDashboardButtonProps {
  dashboardPath?: string;
  label?: string;
  onBeforeNavigate?: () => void; // Optional callback to handle before navigation
}

/**
 * ReturnToDashboardButton Component
 *
 * A reusable floating button that appears in the bottom-right corner
 * of employee dashboard pages. Provides quick navigation back to the
 * main employee dashboard or a custom dashboard path.
 *
 * Usage:
 * ```tsx
 * <ReturnToDashboardButton /> // Returns to /employee-dashboard
 * <ReturnToDashboardButton dashboardPath="/blog-management" label="Back to Blog" />
 * ```
 *
 * RULES FOR EMPLOYEE DASHBOARD PAGES:
 * 1. All employee dashboard pages MUST include this button
 * 2. Employee dashboard pages MUST NOT have a header component
 * 3. Use simple title + description at top instead of header
 * 4. Use consistent padding: py-8 px-4 sm:px-6 lg:px-8
 */
export default function ReturnToDashboardButton({
  dashboardPath = '/employee-dashboard',
  label = 'Return to Dashboard',
  onBeforeNavigate
}: ReturnToDashboardButtonProps) {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Ensure button is clickable after mount
    if (buttonRef.current) {
      buttonRef.current.style.pointerEvents = 'auto';
    }
  }, []);

  const handleNavigation = () => {
    console.log('Navigating to:', dashboardPath);

    try {
      // Use replace: true to avoid adding to browser history
      navigate(dashboardPath, { replace: true });
    } catch (error) {
      console.error('React Router navigation failed:', error);
      // Fallback to direct navigation
      window.location.href = dashboardPath;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // If there's a custom handler, call it instead of navigating directly
    if (onBeforeNavigate) {
      onBeforeNavigate();
    } else {
      handleNavigation();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      // If there's a custom handler, call it instead of navigating directly
      if (onBeforeNavigate) {
        onBeforeNavigate();
      } else {
        handleNavigation();
      }
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
      className="fixed bottom-6 right-6 z-[99999] bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2 font-medium cursor-pointer active:scale-95 border-2 border-blue-500"
      aria-label={label}
      style={{
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        isolation: 'isolate'
      }}
      tabIndex={0}
      role="button"
    >
      <ArrowLeft className="w-5 h-5" />
      {label}
    </button>
  );
}
