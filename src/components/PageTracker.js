import usePageTracking from '../hooks/usePageTracking';

// Component wrapper for the page tracking hook
// Must be rendered inside <Router> to access location
const PageTracker = () => {
  usePageTracking();
  return null;
};

export default PageTracker;
