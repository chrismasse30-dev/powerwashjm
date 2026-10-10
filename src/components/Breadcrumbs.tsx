import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useHeader } from '../contexts/HeaderContext';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const SITE_BASE_URL = 'https://powerwashjm.com';

export default function Breadcrumbs() {
  const location = useLocation();
  const { breadcrumbTop, breadcrumbRef } = useHeader();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    if (segment === 'maintenance-programs') return;

    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    label = label.replace(/\bRi\b/g, 'RI').replace(/\bMa\b/g, 'MA').replace(/\bHoa\b/g, 'HOA');

    if (index > 0 && pathSegments[index - 1] === 'maintenance-programs') {
      label = label + ' Maintenance';
    }

    breadcrumbs.push({ label, path: currentPath });
  });

  useEffect(() => {
    if ((location.pathname.replace(/[/]+$/, '') || '/') === '/') return;

    const scriptId = 'breadcrumb-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: crumb.path === '/' ? `${SITE_BASE_URL}/` : `${SITE_BASE_URL}${crumb.path.replace(/[/]+$/, '')}/`,
      })),
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.setAttribute('data-static', 'true');
      document.head.appendChild(script);
    }

    script.text = JSON.stringify(schema);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [location.pathname]);

  if ((location.pathname.replace(/[/]+$/, '') || '/') === '/') return null;

  return (
    <nav
      ref={breadcrumbRef as React.RefObject<HTMLElement>}
      aria-label="Breadcrumb"
      className="bg-gray-100 border-b border-gray-200 shadow-sm fixed left-0 right-0 z-30 w-full h-10 flex items-center"
      style={{ top: `${breadcrumbTop}px` }}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start">
        <ol className="flex items-center space-x-2 text-sm leading-none">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li key={crumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1.5" aria-hidden="true" />
                )}
                {isLast ? (
                  <span className="text-gray-900 font-semibold text-sm" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-blue-700 hover:text-blue-900 hover:underline transition-colors flex items-center font-medium text-sm"
                  >
                    {isFirst && <Home className="w-4 h-4 mr-1" aria-hidden="true" />}
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
