import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { reportWebVitals } from './utils/webVitals';

const APP_VERSION = '2.6.0-mobile-fix';

console.log('[App] Version:', APP_VERSION);

if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  console.log('[App] Service Worker is controlling this page');
}

const isProduction = window.location.hostname !== 'localhost' &&
                     !window.location.hostname.includes('127.0.0.1') &&
                     !window.location.hostname.includes('webcontainer');

const checkForUpdates = async () => {
  if (!isProduction) {
    console.log('[App] Update check skipped (dev environment)');
    return;
  }

  const lastReload = sessionStorage.getItem('last-reload-time');
  const now = Date.now();

  if (lastReload && (now - parseInt(lastReload)) < 10000) {
    console.log('[App] Skipping update check - recently reloaded');
    return;
  }

  try {
    const response = await fetch('/', {
      method: 'HEAD',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');

    const storedEtag = sessionStorage.getItem('app-etag');
    const storedLastModified = sessionStorage.getItem('app-last-modified');

    if (storedEtag || storedLastModified) {
      if ((etag && etag !== storedEtag) || (lastModified && lastModified !== storedLastModified)) {
        console.log('[App] New version detected - reloading');

        sessionStorage.setItem('last-reload-time', now.toString());

        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }

          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        window.location.reload();
        return;
      }
    }

    if (etag) sessionStorage.setItem('app-etag', etag);
    if (lastModified) sessionStorage.setItem('app-last-modified', lastModified);
  } catch (error) {
    console.log('[App] Update check failed:', error);
  }
};

if (isProduction) {
  const scheduleUpdateCheck = () => {
    checkForUpdates();
    setInterval(checkForUpdates, 5 * 60 * 1000);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(scheduleUpdateCheck, { timeout: 8000 });
  } else {
    setTimeout(scheduleUpdateCheck, 5000);
  }
} else {
  console.log('[App] Auto-update disabled in development');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

reportWebVitals();
