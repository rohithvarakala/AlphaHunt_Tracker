import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './contexts/AuthContext';
import { initGA } from './utils/analytics';
import Navbar from './components/Navbar';
import PageTracker from './components/PageTracker';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Markets from './pages/Markets';
import Screeners from './pages/Screeners';
import Analytics from './pages/Analytics';
import './index.css';

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Navbar />
          <PageTracker />
          <main className="pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/screeners" element={<Screeners />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
        {/* Vercel built-in analytics - tracks real visitors across deployments */}
        <VercelAnalytics />
        <SpeedInsights />
      </Router>
    </AuthProvider>
  );
}

export default App;
