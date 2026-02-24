import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Calendar,
  TrendingUp,
  Briefcase,
  Star,
  LogOut,
  ChevronRight,
  Crown,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserUsageStats, USER_TIERS } from '../services/firestore';
import Navbar from '../components/Navbar';

const Account = () => {
  const navigate = useNavigate();
  const { user, userProfile, logout, isAdmin } = useAuth();
  const [usageStats, setUsageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsageStats();
    }
  }, [user]);

  const loadUsageStats = async () => {
    try {
      const stats = await getUserUsageStats(user.uid);
      setUsageStats(stats);
    } catch (err) {
      console.error('Error loading usage stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'admin':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'premium':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      default:
        return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'admin':
        return 'Admin';
      case 'premium':
        return 'Premium';
      default:
        return 'Free';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-700 text-gray-400 border-gray-600';
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const tier = userProfile?.tier || 'free';

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 rounded-full border-2 border-gray-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(user.displayName || user.email)?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                {userProfile?.displayName || user.displayName || 'User'}
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>

            {/* Tier Badge */}
            <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${getTierColor(tier)}`}>
              {getTierIcon(tier)}
              <span className="text-sm font-medium">{getTierLabel(tier)}</span>
            </div>
          </div>

          {/* Member Since */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            Member since {formatDate(userProfile?.createdAt)}
          </div>
        </motion.div>

        {/* Usage Stats */}
        {usageStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Usage
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Trades */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Briefcase className="w-4 h-4" />
                  Trades
                </div>
                <div className="text-2xl font-bold text-white">
                  {usageStats.trades.count}
                  {usageStats.trades.limit !== Infinity && (
                    <span className="text-gray-500 text-sm font-normal">
                      /{usageStats.trades.limit}
                    </span>
                  )}
                </div>
                {usageStats.trades.limit !== Infinity && (
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (usageStats.trades.count / usageStats.trades.limit) * 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Watchlist */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Star className="w-4 h-4" />
                  Watchlist
                </div>
                <div className="text-2xl font-bold text-white">
                  {usageStats.watchlist.count}
                  {usageStats.watchlist.limit !== Infinity && (
                    <span className="text-gray-500 text-sm font-normal">
                      /{usageStats.watchlist.limit}
                    </span>
                  )}
                </div>
                {usageStats.watchlist.limit !== Infinity && (
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (usageStats.watchlist.count / usageStats.watchlist.limit) * 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Upgrade CTA (for free users) */}
        {tier === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border border-emerald-500/30 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Upgrade to Premium</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Unlock unlimited trades, advanced charts, data export, and priority support.
                </p>
                <button
                  onClick={() => navigate('/upgrade')}
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white
                           font-medium py-2 px-4 rounded-xl hover:from-emerald-600 hover:to-blue-700
                           transition flex items-center gap-2"
                >
                  View Plans
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
        >
          {/* Admin Panel Link */}
          {isAdmin() && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition border-b border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Admin Panel</div>
                  <div className="text-gray-500 text-sm">Manage users & invite codes</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Sign Out</div>
                <div className="text-gray-500 text-sm">Log out of your account</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Account;
