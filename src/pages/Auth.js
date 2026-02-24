import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Ticket,
  AlertCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const navigate = useNavigate();
  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    error: authError
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!inviteCode.trim()) {
          throw new Error('Invite code is required');
        }
        await signUpWithEmail(email, password, displayName, inviteCode);
      } else if (mode === 'login') {
        await signInWithEmail(email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetSent(true);
        setIsLoading(false);
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGoogle(mode === 'signup' ? inviteCode : null);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithApple(mode === 'signup' ? inviteCode : null);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-gray-950 to-blue-900/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AlphaHunt</h1>
          <p className="text-gray-500 mt-1">Track your trades like a pro</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          {/* Mode Tabs */}
          {mode !== 'reset' && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  mode === 'login'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  mode === 'signup'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="mb-6">
              <button
                onClick={() => switchMode('login')}
                className="text-gray-500 hover:text-gray-400 text-sm flex items-center gap-1"
              >
                ← Back to sign in
              </button>
              <h2 className="text-xl font-bold text-white mt-3">Reset Password</h2>
              <p className="text-gray-500 text-sm mt-1">
                Enter your email and we'll send you a reset link
              </p>
            </div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {(error || authError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error || authError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset Success Message */}
          <AnimatePresence>
            {resetSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
              >
                <p className="text-emerald-400 text-sm">
                  Password reset email sent! Check your inbox.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Invite Code (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Invite Code <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXX"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-11 pr-4
                             text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1
                             focus:ring-emerald-500 transition uppercase tracking-wider"
                    required
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  Don't have one? Ask a friend who's already a member
                </p>
              </div>
            )}

            {/* Display Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-11 pr-4
                             text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1
                             focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-11 pr-4
                           text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1
                           focus:ring-emerald-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password (not for reset) */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-11 pr-11
                             text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1
                             focus:ring-emerald-500 transition"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-medium
                       py-3 rounded-xl hover:from-emerald-600 hover:to-blue-700 transition
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth (not for reset) */}
          {mode !== 'reset' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-900 px-4 text-gray-600 text-sm">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 border
                           border-gray-700 rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-white text-sm font-medium">Google</span>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={handleAppleAuth}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 border
                           border-gray-700 rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span className="text-white text-sm font-medium">Apple</span>
                </button>
              </div>

              {mode === 'signup' && (
                <p className="text-gray-600 text-xs text-center mt-4">
                  For social sign-up, enter your invite code above first
                </p>
              )}
            </>
          )}
        </div>

        {/* Terms */}
        <p className="text-gray-600 text-xs text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
