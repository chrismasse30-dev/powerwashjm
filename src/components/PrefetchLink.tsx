import { Link, LinkProps } from 'react-router-dom';
import { ComponentType, lazy, useCallback } from 'react';

interface PrefetchLinkProps extends LinkProps {
  prefetchDelay?: number;
}

// Route to dynamic import mapping
const routeImports: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  '/': () => import('../pages/HomePage'),
  '/house-washing': () => import('../pages/HouseWashingPage'),
  '/roof-cleaning': () => import('../pages/RoofCleaningPage'),
  '/deck-cleaning': () => import('../pages/DeckCleaningPage'),
  '/concrete-cleaning': () => import('../pages/ConcreteCleaningPage'),
  '/gutter-cleaning': () => import('../pages/GutterCleaningPage'),
  '/fleet-washing': () => import('../pages/FleetWashingPage'),
  '/hoa-condo-cleaning': () => import('../pages/HOACondoCleaningPage'),
  '/holiday-lights': () => import('../pages/HolidayLightsPage'),
  '/commercial': () => import('../pages/CommercialPage'),
  '/about': () => import('../pages/AboutUsPage'),
  '/blog': () => import('../pages/BlogPage'),
  '/get-quote': () => import('../pages/GetQuotePage'),
  '/instant-estimate': () => import('../pages/InstantEstimatePage'),
  '/service-areas': () => import('../pages/TownsPage'),
  '/gallery': () => import('../pages/GalleryManagementPage'),
  '/faq': () => import('../pages/FAQPage'),
  '/satisfaction-guarantee': () => import('../pages/SatisfactionGuaranteePage'),
  '/financing': () => import('../pages/FinancingPage'),
};

// Simple cache to track what's been prefetched
const prefetchedRoutes = new Set<string>();

/**
 * Enhanced Link component that prefetches route chunks on hover/focus
 *
 * Benefits:
 * - Instant-feeling navigation (chunks load before click)
 * - No additional network cost if user doesn't navigate
 * - Respects user data (only prefetches on intent)
 *
 * Usage: Replace <Link> with <PrefetchLink>
 */
export function PrefetchLink({
  to,
  children,
  prefetchDelay = 0,
  ...props
}: PrefetchLinkProps) {
  const routePath = typeof to === 'string' ? to : to.pathname || '';

  const prefetch = useCallback(() => {
    if (prefetchedRoutes.has(routePath)) return;

    const importFn = routeImports[routePath];
    if (importFn) {
      if (prefetchDelay > 0) {
        setTimeout(() => {
          importFn().then(() => {
            prefetchedRoutes.add(routePath);
          });
        }, prefetchDelay);
      } else {
        importFn().then(() => {
          prefetchedRoutes.add(routePath);
        });
      }
    }
  }, [routePath, prefetchDelay]);

  return (
    <Link
      to={to}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}
