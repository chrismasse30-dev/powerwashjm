import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

function sendToGoogleAnalytics({ name, delta, id }: Metric) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      event_label: id,
      non_interaction: true,
    });
  }
}

function sendToConsole({ name, value, rating }: Metric) {
  const color = rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red';
  console.log(
    `%c${name}: ${Math.round(value)}ms (${rating})`,
    `color: ${color}; font-weight: bold;`
  );
}

export function reportWebVitals() {
  try {
    onCLS(sendToGoogleAnalytics);
    onINP(sendToGoogleAnalytics);
    onFCP(sendToGoogleAnalytics);
    onLCP(sendToGoogleAnalytics);
    onTTFB(sendToGoogleAnalytics);

    if (import.meta.env.DEV) {
      onCLS(sendToConsole);
      onINP(sendToConsole);
      onFCP(sendToConsole);
      onLCP(sendToConsole);
      onTTFB(sendToConsole);
    }
  } catch (error) {
    console.error('Error reporting web vitals:', error);
  }
}
