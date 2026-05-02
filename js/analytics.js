/* ============================================================
   TruthStamp — Google Analytics
   SINGLE SOURCE OF TRUTH for tracking.
   To change tracking ID: edit GA_TRACKING_ID below. That's it.
   ============================================================ */

(function() {
  // Replace this with your real GA4 Measurement ID before going live
  const GA_TRACKING_ID = 'G-XXXXXXXXXX';

  // Don't load analytics in local development
  const isLocalDev = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
  if (isLocalDev) {
    console.log('[Analytics] Skipped — local development');
    return;
  }

  // Don't load if no real tracking ID is set
  if (GA_TRACKING_ID === 'G-XXXXXXXXXX') {
    console.warn('[Analytics] Tracking ID not configured');
    return;
  }

  // Inject the gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_TRACKING_ID;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });

  // Helper: track custom events from anywhere
  // Usage: window.trackEvent('stamp_created', { type: 'text', visibility: 'public' });
  window.trackEvent = function(eventName, params) {
    if (window.gtag) {
      window.gtag('event', eventName, params || {});
    }
  };
})();
