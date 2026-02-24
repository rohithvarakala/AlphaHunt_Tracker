import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * @param {ReactNode} children - The component to render if authenticated
 * @param {string} requiredTier - Optional tier requirement ('free', 'premium', 'admin')
 * @param {boolean} allowGuest - If true, allows unauthenticated users (shows demo data)
 */
const ProtectedRoute = ({ children, requiredTier = null, allowGuest = false }) => {
  const { user, userProfile, loading, hasTier } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (allowGuest) {
      // Allow guest access (will show demo data)
      return children;
    }
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check tier requirement
  if (requiredTier && !hasTier(requiredTier)) {
    // User doesn't have required tier - redirect to upgrade page
    return <Navigate to="/upgrade" state={{ required: requiredTier }} replace />;
  }

  return children;
};

/**
 * AdminRoute - Shorthand for admin-only routes
 */
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredTier="admin">
      {children}
    </ProtectedRoute>
  );
};

/**
 * PremiumRoute - Shorthand for premium-only routes
 */
export const PremiumRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredTier="premium">
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
