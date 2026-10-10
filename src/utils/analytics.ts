/**
 * Google Analytics 4 Tracking Utility
 * Provides client-side and server-side event tracking
 */

interface GA4Event {
  name: string;
  params?: Record<string, any>;
}

interface GA4User {
  client_id: string;
  user_id?: string;
  user_properties?: Record<string, any>;
}

/**
 * Client-side event tracking using gtag.js
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

/**
 * Track page views
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
};

/**
 * Server-side event tracking using Measurement Protocol
 */
export const sendServerEvent = async (
  events: GA4Event[],
  userId?: string,
  sessionId?: string
) => {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const apiSecret = import.meta.env.VITE_GA4_API_SECRET;

  if (!measurementId || !apiSecret || measurementId === 'G-XXXXXXXXXX') {
    console.warn('GA4 not configured. Skipping server-side event tracking.');
    return;
  }

  // Generate or use existing client ID
  let clientId = sessionId || generateClientId();

  if (typeof window !== 'undefined') {
    const storedClientId = localStorage.getItem('ga_client_id');
    if (storedClientId) {
      clientId = storedClientId;
    } else {
      localStorage.setItem('ga_client_id', clientId);
    }
  }

  const payload: any = {
    client_id: clientId,
    events: events.map(event => ({
      name: event.name,
      params: {
        ...event.params,
        engagement_time_msec: '100',
        session_id: sessionId || Date.now().toString(),
      }
    }))
  };

  if (userId) {
    payload.user_id = userId;
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      console.error('Failed to send GA4 event:', response.status);
    }
  } catch (error) {
    console.error('Error sending GA4 event:', error);
  }
};

/**
 * Track form submissions
 */
export const trackFormSubmission = (formType: string, formData?: Record<string, any>) => {
  trackEvent('form_submit', {
    form_type: formType,
    ...formData
  });

  sendServerEvent([{
    name: 'form_submit',
    params: {
      form_type: formType,
      ...formData
    }
  }]);
};

/**
 * Track quote requests - fires multiple key events for the sales funnel
 */
export const trackQuoteRequest = (quoteData: {
  service?: string;
  property_type?: string;
  estimated_value?: number;
  location?: string;
}) => {
  // Track form submission
  trackEvent('form_submit', {
    form_type: 'quote_request',
    currency: 'USD',
    value: quoteData.estimated_value || 0,
    ...quoteData
  });

  // Track lead qualification
  trackEvent('qualify_lead', {
    currency: 'USD',
    value: quoteData.estimated_value || 0,
    ...quoteData
  });

  // Track lead generation
  trackEvent('generate_lead', {
    currency: 'USD',
    value: quoteData.estimated_value || 0,
    ...quoteData
  });

  // Send all events to server
  sendServerEvent([
    {
      name: 'form_submit',
      params: {
        form_type: 'quote_request',
        currency: 'USD',
        value: quoteData.estimated_value || 0,
        ...quoteData
      }
    },
    {
      name: 'qualify_lead',
      params: {
        currency: 'USD',
        value: quoteData.estimated_value || 0,
        ...quoteData
      }
    },
    {
      name: 'generate_lead',
      params: {
        currency: 'USD',
        value: quoteData.estimated_value || 0,
        ...quoteData
      }
    }
  ]);
};

/**
 * Track chat interactions
 */
export const trackChatEvent = (action: string, details?: Record<string, any>) => {
  trackEvent('chat_interaction', {
    action,
    ...details
  });

  sendServerEvent([{
    name: 'chat_interaction',
    params: {
      action,
      ...details
    }
  }]);
};

/**
 * Track button clicks
 */
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location || window.location.pathname
  });
};

/**
 * Track file downloads
 */
export const trackDownload = (fileName: string, fileType?: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    location: window.location.pathname
  });
};

/**
 * Generate a unique client ID
 */
function generateClientId(): string {
  return `${Date.now()}.${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', 'user_properties', properties);
  }
};

/**
 * Track custom conversion events
 */
export const trackConversion = (conversionName: string, value?: number) => {
  trackEvent(conversionName, {
    currency: 'USD',
    value: value || 0
  });

  sendServerEvent([{
    name: conversionName,
    params: {
      currency: 'USD',
      value: value || 0
    }
  }]);
};

/**
 * Track when a lead closes (converts to a customer)
 */
export const trackLeadClose = (leadData: {
  customer_name?: string;
  service?: string;
  transaction_value?: number;
  location?: string;
}) => {
  trackEvent('close_convert_lead', {
    currency: 'USD',
    value: leadData.transaction_value || 0,
    ...leadData
  });

  sendServerEvent([{
    name: 'close_convert_lead',
    params: {
      currency: 'USD',
      value: leadData.transaction_value || 0,
      ...leadData
    }
  }]);
};

/**
 * Track purchase completion
 */
export const trackPurchase = (purchaseData: {
  transaction_id?: string;
  value: number;
  currency?: string;
  items?: any[];
}) => {
  trackEvent('purchase', {
    transaction_id: purchaseData.transaction_id || `txn_${Date.now()}`,
    currency: purchaseData.currency || 'USD',
    value: purchaseData.value,
    items: purchaseData.items || []
  });

  sendServerEvent([{
    name: 'purchase',
    params: {
      transaction_id: purchaseData.transaction_id || `txn_${Date.now()}`,
      currency: purchaseData.currency || 'USD',
      value: purchaseData.value,
      items: purchaseData.items || []
    }
  }]);
};

/**
 * Track newsletter signup
 */
export const trackNewsletterSignup = (signupData: {
  email_domain?: string;
  source?: string;
  location?: string;
}) => {
  trackEvent('sign_up_for_our_specials', {
    email_domain: signupData.email_domain || 'unknown',
    source: signupData.source || 'unknown',
    location: signupData.location || 'unknown'
  });

  sendServerEvent([{
    name: 'sign_up_for_our_specials',
    params: {
      email_domain: signupData.email_domain || 'unknown',
      source: signupData.source || 'unknown',
      location: signupData.location || 'unknown'
    }
  }]);
};
