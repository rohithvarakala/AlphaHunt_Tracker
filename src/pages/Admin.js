import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Trash2,
  Users,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  createInviteCode,
  getAllInviteCodes,
  deactivateInviteCode
} from '../services/firestore';
import Navbar from '../components/Navbar';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [inviteCodes, setInviteCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCodeUses, setNewCodeUses] = useState(1);
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState('');

  // Load invite codes
  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await getAllInviteCodes();
      setInviteCodes(codes);
    } catch (err) {
      setError('Failed to load invite codes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCode = async () => {
    setIsCreating(true);
    setError('');

    try {
      const code = await createInviteCode(user.uid, newCodeUses);
      await loadCodes();
      // Auto-copy new code
      copyToClipboard(code);
    } catch (err) {
      setError('Failed to create invite code');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivate = async (code) => {
    try {
      await deactivateInviteCode(code);
      await loadCodes();
    } catch (err) {
      setError('Failed to deactivate code');
      console.error(err);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
            <p className="text-gray-500">You don't have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-7 h-7 text-emerald-400" />
              Admin Panel
            </h1>
            <p className="text-gray-500 mt-1">Manage invite codes and users</p>
          </div>
          <button
            onClick={loadCodes}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create New Code */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-400" />
            Create Invite Code
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm mb-2">Max Uses</label>
              <select
                value={newCodeUses}
                onChange={(e) => setNewCodeUses(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4
                         text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value={1}>1 use (single invite)</option>
                <option value={5}>5 uses</option>
                <option value={10}>10 uses</option>
                <option value={25}>25 uses</option>
                <option value={100}>100 uses</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCreateCode}
                disabled={isCreating}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-blue-600 text-white
                         font-medium py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-blue-700
                         transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Generate Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Invite Codes List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              All Invite Codes
              <span className="text-gray-500 text-sm font-normal">({inviteCodes.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : inviteCodes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No invite codes yet. Create one above!
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {inviteCodes.map((code) => (
                <motion.div
                  key={code.code}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 flex items-center justify-between ${
                    !code.active ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Code */}
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-800 px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-sm">
                        {code.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition"
                        title="Copy code"
                      >
                        {copiedCode === code.code ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Status Badge */}
                    {!code.active ? (
                      <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                        Inactive
                      </span>
                    ) : code.uses >= code.maxUses ? (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        Used up
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Usage */}
                    <div className="text-right hidden sm:block">
                      <div className="text-white text-sm">
                        {code.uses} / {code.maxUses} uses
                      </div>
                      <div className="text-gray-500 text-xs flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {formatDate(code.createdAt)}
                      </div>
                    </div>

                    {/* Deactivate */}
                    {code.active && (
                      <button
                        onClick={() => handleDeactivate(code.code)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        title="Deactivate code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Used By Details */}
        {inviteCodes.some(c => c.usedBy?.length > 0) && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Signups</h2>
            <div className="space-y-2">
              {inviteCodes
                .flatMap(c => c.usedBy?.map(u => ({ ...u, code: c.code })) || [])
                .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
                .slice(0, 10)
                .map((usage, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{usage.userId.slice(0, 8)}...</span>
                    <span className="text-gray-500">
                      via <code className="text-emerald-400">{usage.code}</code>
                    </span>
                    <span className="text-gray-600">{formatDate(usage.usedAt)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
