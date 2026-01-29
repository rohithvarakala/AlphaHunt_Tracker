// Google Analytics 4 integration
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

// Initialize GA4 by injecting the script tag
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) return;

  // Add gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // We'll track manually with router
  });
};

// Track page views
export const trackPageView = (path, title) => {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
};

// Track custom events
export const trackEvent = (eventName, params = {}) => {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('event', eventName, params);
};

// Predefined events for AlphaHunt
export const analyticsEvents = {
  addTrade: (ticker) => trackEvent('add_trade', { ticker }),
  deleteTrade: (ticker) => trackEvent('delete_trade', { ticker }),
  exportCSV: () => trackEvent('export_csv'),
  addToWatchlist: (ticker) => trackEvent('add_to_watchlist', { ticker }),
  removeFromWatchlist: (ticker) => trackEvent('remove_from_watchlist', { ticker }),
  runScreener: (name) => trackEvent('run_screener', { screener_name: name }),
  createScreener: (name) => trackEvent('create_screener', { screener_name: name }),
  signIn: () => trackEvent('sign_in', { method: 'google' }),
  signOut: () => trackEvent('sign_out'),
  refreshPrices: () => trackEvent('refresh_prices'),
  searchStock: (query) => trackEvent('search_stock', { search_term: query }),
};
