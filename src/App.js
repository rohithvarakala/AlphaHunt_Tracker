import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './contexts/AuthContext';
import { initGA } from './utils/analytics';
import Navbar from './components/Navbar';
import PageTracker from './components/PageTracker';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import TradeActivity from './pages/TradeActivity';
import Markets from './pages/Markets';
import Screeners from './pages/Screeners';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Admin from './pages/Admin';
import Upgrade from './pages/Upgrade';

import './index.css';

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <PageTracker />
          <Routes>
            {/* Auth page - no navbar */}
            <Route path="/auth" element={<Auth />} />

            {/* Main app routes - with navbar */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowGuest>
                  <>
                    <Navbar />
                    <main className="pb-20 md:pb-0">
                      <Dashboard />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute allowGuest>
                  <>
                    <Navbar />
                    <main className="pb-20 md:pb-0">
                      <TradeActivity />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/markets"
              element={
                <ProtectedRoute allowGuest>
                  <>
                    <Navbar />
                    <main className="pb-20 md:pb-0">
                      <Markets />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/screeners"
              element={
                <ProtectedRoute allowGuest>
                  <>
                    <Navbar />
                    <main className="pb-20 md:pb-0">
                      <Screeners />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowGuest>
                  <>
                    <Navbar />
                    <main className="pb-20 md:pb-0">
                      <Analytics />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredTier="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upgrade"
              element={
                <ProtectedRoute>
                  <Upgrade />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {/* Vercel built-in analytics - tracks real visitors across deployments */}
        <VercelAnalytics />
        <SpeedInsights />
      </Router>
    </AuthProvider>
  );
}

export default App;
