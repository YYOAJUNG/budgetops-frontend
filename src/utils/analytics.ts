// Google Analytics & Google Tag Manager utility functions
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
    google_tag_manager?: any;
  }
}

// Initialize Google Tag Manager
export const initGTM = (gtmId: string) => {
  // Initialize dataLayer before GTM script
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  // Add GTM script to head
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(gtmScript);

  // Add GTM noscript iframe to body (for fallback)
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);

  console.log('🚀 GTM Initialized:', gtmId);
};

// Initialize Google Analytics (keeping for backward compatibility)
export const initGA = (measurementId: string) => {
  // Create script tag for gtag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('🚀 GA4 Initialized:', measurementId);
};

// Combined initialization function
export const initAnalytics = (gaId: string, gtmId?: string) => {
  console.log('🔧 Initializing Analytics...');
  
  if (gtmId && gtmId !== 'GTM-XXXXXXX') {
    initGTM(gtmId);
  }
  
  if (gaId && gaId !== 'G-XXXXXXXXXX') {
    initGA(gaId);
  }
};

// Track button clicks (Enhanced with GTM dataLayer)
export const trackButtonClick = (
  buttonName: string, 
  category: string = 'Button',
  page?: string,
  additionalData?: Record<string, any>
) => {
  const eventData = {
    event: 'button_click',
    button_name: buttonName,
    event_category: category,
    page_location: window.location.href,
    page_title: document.title,
    page_path: page || window.location.pathname,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  // Send to GTM dataLayer (GTM will handle GA4 automatically)
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }

  // Also send directly to GA4 (fallback)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', {
      event_category: category,
      event_label: buttonName,
      page: page || window.location.pathname,
      ...additionalData
    });
    
    window.gtag('event', 'button_click', {
      button_name: buttonName,
      page_location: window.location.href,
      page_title: document.title,
      category: category,
      ...additionalData
    });
  }
  
  // Console log for development
  console.log('📊 Analytics Event:', eventData);
};

// Track page views (Enhanced with GTM dataLayer)
export const trackPageView = (pageName: string, pageTitle?: string) => {
  const eventData = {
    event: 'page_view',
    page_name: pageName,
    page_title: pageTitle || pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  };

  // Send to GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }

  // Also send directly to GA4 (fallback)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle || pageName,
      page_location: window.location.href,
      page_name: pageName
    });
  }
  
  console.log('📊 Analytics Page View:', eventData);
};

// Track login events (Enhanced with GTM dataLayer)
export const trackLogin = (method: string = 'email') => {
  const eventData = {
    event: 'login',
    login_method: method,
    timestamp: new Date().toISOString()
  };

  // Send to GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }

  // Also send directly to GA4 (fallback)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method
    });
  }
  
  console.log('📊 Analytics Login:', eventData);
};

// Track custom events (Enhanced with GTM dataLayer)
export const trackCustomEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...parameters
  };

  // Send to GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }

  // Also send directly to GA4 (fallback)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
  
  console.log('📊 Analytics Custom Event:', eventData);
};

// Enhanced tracking for CloudDash specific events
export const trackCloudDashEvent = (
  eventType: 'resource_view' | 'cost_analysis' | 'ai_suggestion' | 'dashboard_action',
  details?: Record<string, any>
) => {
  const eventData = {
    event: 'clouddash_interaction',
    interaction_type: eventType,
    app_name: 'CloudDash',
    app_version: '1.0.0',
    timestamp: new Date().toISOString(),
    ...details
  };

  // Send to GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }

  console.log('📊 CloudDash Event:', eventData);
};