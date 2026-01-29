import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/watchlist': 'Watchlist',
  '/markets': 'Markets',
  '/screeners': 'Screeners',
  '/analytics': 'Analytics',
};

// Track page views on route change + record in localStorage for in-app dashboard
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const title = PAGE_TITLES[path] || 'AlphaHunt';

    // Track in Google Analytics
    trackPageView(path, title);

    // Record in localStorage for in-app analytics dashboard
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();

      // Page views log
      const views = JSON.parse(localStorage.getItem('alphahunt_pageviews') || '[]');
      views.push({
        path,
        title,
        timestamp: now.toISOString(),
        date: today,
        hour,
      });
      // Keep last 10000 entries
      if (views.length > 10000) views.splice(0, views.length - 10000);
      localStorage.setItem('alphahunt_pageviews', JSON.stringify(views));

      // Session tracking
      const sessionId = sessionStorage.getItem('alphahunt_session');
      if (!sessionId) {
        const newSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem('alphahunt_session', newSessionId);

        const sessions = JSON.parse(localStorage.getItem('alphahunt_sessions') || '[]');
        sessions.push({
          id: newSessionId,
          start: now.toISOString(),
          date: today,
          referrer: document.referrer || 'direct',
          userAgent: navigator.userAgent,
        });
        if (sessions.length > 5000) sessions.splice(0, sessions.length - 5000);
        localStorage.setItem('alphahunt_sessions', JSON.stringify(sessions));
      }

      // Daily visitor count
      const dailyStats = JSON.parse(localStorage.getItem('alphahunt_daily_stats') || '{}');
      if (!dailyStats[today]) {
        dailyStats[today] = { views: 0, sessions: 0, pages: {} };
      }
      dailyStats[today].views += 1;
      dailyStats[today].pages[path] = (dailyStats[today].pages[path] || 0) + 1;
      if (!sessionId) {
        dailyStats[today].sessions += 1;
      }

      // Keep last 90 days
      const keys = Object.keys(dailyStats).sort();
      if (keys.length > 90) {
        keys.slice(0, keys.length - 90).forEach(k => delete dailyStats[k]);
      }
      localStorage.setItem('alphahunt_daily_stats', JSON.stringify(dailyStats));
    } catch (error) {
      // Silently fail - analytics should never break the app
    }
  }, [location]);
};

export default usePageTracking;
