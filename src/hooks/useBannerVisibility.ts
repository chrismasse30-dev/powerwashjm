import { useHeader } from '../contexts/HeaderContext';
import type { CSSProperties } from 'react';

/**
 * Thin compatibility wrapper around the HeaderContext singleton.
 * Returns nav offsets used by pages to clear the fixed header.
 */
export function useBannerVisibility() {
  const { navOffset, navOffsetWithBreadcrumb } = useHeader();

  const getNavOffset = (): CSSProperties => navOffset;
  const getNavOffsetWithBreadcrumb = (): CSSProperties => navOffsetWithBreadcrumb;
  const getPageTopPadding = () => '';

  return {
    bannerVisible: false,
    isLoading: false,
    getPageTopPadding,
    getNavOffset,
    getNavOffsetWithBreadcrumb,
  };
}
