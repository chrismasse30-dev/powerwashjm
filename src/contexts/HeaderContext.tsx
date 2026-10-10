import { createContext, useContext, useEffect, useLayoutEffect, useState, useRef, useCallback, ReactNode } from 'react';
import type { CSSProperties } from 'react';

interface HeaderContextType {
  navHeight: number;
  breadcrumbHeight: number;
  /** marginTop to clear just the nav. Use on homepage. */
  navOffset: CSSProperties;
  /** marginTop to clear nav + breadcrumb bar. Use on all pages that show breadcrumbs. */
  navOffsetWithBreadcrumb: CSSProperties;
  /** px value for breadcrumb top positioning */
  breadcrumbTop: number;
  /** Refs to attach to the actual DOM nodes so we can measure them */
  navRef: React.MutableRefObject<HTMLElement | null>;
  breadcrumbRef: React.MutableRefObject<HTMLElement | null>;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [navHeight, setNavHeight] = useState(() => {
    if (typeof window === 'undefined') return 96;
    return window.matchMedia('(min-width: 1024px)').matches ? 112 : 96;
  });
  const [breadcrumbHeight, setBreadcrumbHeight] = useState(52);

  const navRef = useRef<HTMLElement | null>(null);
  const breadcrumbRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const safe = (n: number | undefined, fallback: number) =>
    Number.isFinite(n) && (n as number) > 0 ? (n as number) : fallback;

  const measureHeights = useCallback(() => {
    if (navRef.current) {
      setNavHeight(safe(navRef.current.getBoundingClientRect().height, 112));
    }
    if (breadcrumbRef.current) {
      setBreadcrumbHeight(safe(breadcrumbRef.current.getBoundingClientRect().height, 52));
    }
  }, []);

  useLayoutEffect(() => {
    measureHeights();
  }, [measureHeights]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      measureHeights();
      const observer = new ResizeObserver(measureHeights);
      if (navRef.current) observer.observe(navRef.current);
      if (breadcrumbRef.current) observer.observe(breadcrumbRef.current);
      observerRef.current = observer;
    });

    const handleResize = () => measureHeights();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      observerRef.current?.disconnect();
    };
  }, [measureHeights]);

  const breadcrumbTop = navHeight;
  const navOffset: CSSProperties = { paddingTop: `${breadcrumbTop}px` };
  const navOffsetWithBreadcrumb: CSSProperties = { paddingTop: `${breadcrumbTop + breadcrumbHeight}px` };

  return (
    <HeaderContext.Provider value={{
      navHeight,
      breadcrumbHeight,
      navOffset,
      navOffsetWithBreadcrumb,
      breadcrumbTop,
      navRef,
      breadcrumbRef,
    }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used inside HeaderProvider');
  return ctx;
}
