import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, User, ChevronDown, Settings, Shield, Crown, Star,
  LayoutDashboard, Activity, TrendingUp, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Reordered: Dashboard, Screeners, Markets, Trade Activity (no Analytics)
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/screeners', label: 'Screeners', icon: Filter },
    { path: '/markets', label: 'Markets', icon: TrendingUp },
    { path: '/activity', label: 'Activity', icon: Activity },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/');
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'admin':
        return <Shield className="w-3 h-3 text-purple-400" />;
      case 'premium':
        return <Crown className="w-3 h-3 text-yellow-400" />;
      default:
        return null;
    }
  };

  const tier = userProfile?.tier || 'free';

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AH</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                AlphaHunt
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-800/50 transition"
                  >
                    <div className="relative">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full border-2 border-emerald-500/50"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(userProfile?.displayName || user.email)?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      {/* Tier badge */}
                      {tier !== 'free' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                          {getTierIcon(tier)}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                        >
                          {/* User Info */}
                          <div className="p-4 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium truncate flex-1">
                                {userProfile?.displayName || user.displayName || 'User'}
                              </p>
                              {tier !== 'free' && (
                                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  tier === 'admin'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {getTierIcon(tier)}
                                  {tier === 'admin' ? 'Admin' : 'Pro'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm truncate">{user.email}</p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              to="/account"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800 transition"
                            >
                              <Settings size={16} />
                              Account Settings
                            </Link>

                            {isAdmin() && (
                              <Link
                                to="/admin"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-purple-400 hover:bg-gray-800 transition"
                              >
                                <Shield size={16} />
                                Admin Panel
                              </Link>
                            )}

                            {tier === 'free' && (
                              <Link
                                to="/upgrade"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-emerald-400 hover:bg-gray-800 transition"
                              >
                                <Crown size={16} />
                                Upgrade to Pro
                              </Link>
                            )}
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gray-700 py-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-800 transition"
                            >
                              <LogOut size={16} />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-blue-700 transition"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar - Always visible on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-emerald-400'
                  : 'text-gray-500'
              }`}
            >
              <item.icon size={22} className={isActive(item.path) ? 'text-emerald-400' : ''} />
              <span className={`text-xs mt-1 font-medium ${isActive(item.path) ? 'text-emerald-400' : ''}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
