import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Bell, BellOff, Star, Plus, X, TrendingUp, TrendingDown,
  RefreshCw, Trash2, ArrowUpRight, ArrowDownRight, Clock, MessageSquare,
  CheckCircle, AlertCircle, Zap, Target, DollarSign, Filter, Cloud, HardDrive
} from 'lucide-react';
import StockSearch from '../components/StockSearch';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToWatchlist,
  addToWatchlist as addToWatchlistFirestore,
  removeFromWatchlist as removeFromWatchlistFirestore,
  toggleWatchlistAlerts
} from '../services/firestore';

const FINNHUB_KEY = process.env.REACT_APP_FINNHUB_API_KEY || '';

// Simulated verified trade feed data
const generateVerifiedTrades = () => {
  const trades = [
    { id: 1, symbol: 'NVDA', action: 'BUY', price: 875.50, shares: 50, time: new Date(Date.now() - 1000 * 60 * 5), rationale: 'AI momentum play ahead of earnings. Strong technical breakout above $850 resistance.', status: 'open', pnl: 12.5, verified: true },
    { id: 2, symbol: 'AAPL', action: 'SELL', price: 178.25, shares: 100, time: new Date(Date.now() - 1000 * 60 * 30), rationale: 'Taking profits after 15% run. RSI overbought at 78.', status: 'closed', pnl: 8.2, verified: true },
    { id: 3, symbol: 'TSLA', action: 'BUY', price: 245.00, shares: 30, time: new Date(Date.now() - 1000 * 60 * 60), rationale: 'Bullish engulfing pattern on daily. Support held at $240.', status: 'open', pnl: -2.1, verified: true },
    { id: 4, symbol: 'META', action: 'BUY', price: 505.75, shares: 25, time: new Date(Date.now() - 1000 * 60 * 120), rationale: 'Strong Q4 guidance. Adding to core position.', status: 'open', pnl: 5.8, verified: true },
    { id: 5, symbol: 'AMD', action: 'SELL', price: 165.30, shares: 75, time: new Date(Date.now() - 1000 * 60 * 180), rationale: 'Hit profit target. Sector rotation concerns.', status: 'closed', pnl: 22.4, verified: true },
    { id: 6, symbol: 'GOOGL', action: 'BUY', price: 142.80, shares: 40, time: new Date(Date.now() - 1000 * 60 * 240), rationale: 'Undervalued vs peers. AI search monetization thesis.', status: 'open', pnl: 3.2, verified: true },
    { id: 7, symbol: 'MSFT', action: 'BUY', price: 415.50, shares: 20, time: new Date(Date.now() - 1000 * 60 * 300), rationale: 'Cloud growth re-accelerating. Copilot momentum.', status: 'open', pnl: 4.5, verified: true },
    { id: 8, symbol: 'AMZN', action: 'SELL', price: 185.20, shares: 60, time: new Date(Date.now() - 1000 * 60 * 360), rationale: 'Trimming ahead of retail sales data. Protecting gains.', status: 'closed', pnl: 11.2, verified: true },
  ];
  return trades;
};

// Simulated live signals
const generateSignals = () => [
  { id: 1, type: 'entry', symbol: 'PLTR', price: 22.50, target: 28.00, stop: 20.00, time: new Date(Date.now() - 1000 * 60 * 2), confidence: 'high', rationale: 'Breaking out of consolidation. Government contract catalyst.' },
  { id: 2, type: 'exit', symbol: 'COIN', price: 225.00, reason: 'Target hit', time: new Date(Date.now() - 1000 * 60 * 15), pnlPercent: 18.5 },
  { id: 3, type: 'alert', symbol: 'SPY', message: 'Approaching key resistance at $480. Watch for rejection.', time: new Date(Date.now() - 1000 * 60 * 45) },
  { id: 4, type: 'entry', symbol: 'CRWD', price: 315.00, target: 350.00, stop: 295.00, time: new Date(Date.now() - 1000 * 60 * 90), confidence: 'medium', rationale: 'Cybersecurity spending uptick. Technical support holding.' },
];

const TradeActivity = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [verifiedTrades] = useState(() => generateVerifiedTrades());
  const [signals] = useState(() => generateSignals());
  const [watchlist, setWatchlist] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [priceData, setPriceData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('all');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Load watchlist from Firestore (logged in) or localStorage (guest)
  useEffect(() => {
    if (user) {
      // Subscribe to real-time Firestore updates
      setIsCloudSynced(true);
      const unsubscribe = subscribeToWatchlist(user.uid, (firestoreWatchlist) => {
        setWatchlist(firestoreWatchlist);
      });
      return () => unsubscribe();
    } else {
      // Fall back to localStorage for guests
      setIsCloudSynced(false);
      const saved = localStorage.getItem('alphahunt_watchlist');
      if (saved) {
        setWatchlist(JSON.parse(saved));
      }
    }
  }, [user]);

  const saveWatchlistLocal = (list) => {
    localStorage.setItem('alphahunt_watchlist', JSON.stringify(list));
    setWatchlist(list);
  };

  // Fetch prices for watchlist
  const fetchPrices = useCallback(async () => {
    if (watchlist.length === 0) return;
    setIsLoading(true);
    const prices = {};
    for (const item of watchlist) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${FINNHUB_KEY}`
        );
        const data = await response.json();
        if (data && data.c && data.c > 0) {
          prices[item.symbol] = {
            price: data.c,               // current price
            change: data.d || 0,          // change
            changePercent: data.dp || 0,  // change percent
          };
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching ${item.symbol}:`, error);
      }
    }
    setPriceData(prices);
    setIsLoading(false);
  }, [watchlist]);

  useEffect(() => {
    if (activeTab === 'watchlist') {
      fetchPrices();
    }
  }, [activeTab, fetchPrices]);

  const addToWatchlist = async (stock) => {
    if (!watchlist.find(w => w.symbol === stock.symbol)) {
      if (user) {
        // Save to Firestore
        try {
          await addToWatchlistFirestore(user.uid, stock);
        } catch (error) {
          console.error('Error adding to watchlist:', error);
        }
      } else {
        // Save to localStorage for guests
        const newItem = { ...stock, alerts: true, addedAt: new Date().toISOString() };
        saveWatchlistLocal([...watchlist, newItem]);
      }
    }
    setShowAddModal(false);
  };

  const removeFromWatchlist = async (symbol) => {
    if (user) {
      try {
        await removeFromWatchlistFirestore(user.uid, symbol);
      } catch (error) {
        console.error('Error removing from watchlist:', error);
      }
    } else {
      saveWatchlistLocal(watchlist.filter(w => w.symbol !== symbol));
    }
  };

  const toggleAlerts = async (symbol) => {
    const item = watchlist.find(w => w.symbol === symbol);
    if (!item) return;

    if (user) {
      try {
        await toggleWatchlistAlerts(user.uid, symbol, !item.alerts);
      } catch (error) {
        console.error('Error toggling alerts:', error);
      }
    } else {
      saveWatchlistLocal(watchlist.map(w =>
        w.symbol === symbol ? { ...w, alerts: !w.alerts } : w
      ));
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredTrades = filterAction === 'all'
    ? verifiedTrades
    : verifiedTrades.filter(t => t.action.toLowerCase() === filterAction);

  const tabs = [
    { id: 'feed', label: 'Trade Feed', icon: Activity },
    { id: 'signals', label: 'Live Signals', icon: Zap },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-emerald-400" size={28} />
            Trade Activity
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">Verified trades, signals & your watchlist</p>
            {/* Cloud sync indicator */}
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
              isCloudSynced
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-700/50 text-gray-400'
            }`}>
              {isCloudSynced ? <Cloud size={12} /> : <HardDrive size={12} />}
              {isCloudSynced ? 'Synced' : 'Local only'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${
              notificationsEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            <span className="hidden sm:inline">{notificationsEnabled ? 'Alerts On' : 'Alerts Off'}</span>
          </button>
          {activeTab === 'watchlist' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg transition text-sm"
            >
              <Plus size={16} />
              Add Stock
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.id === 'signals' && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                {signals.filter(s => s.type === 'entry').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Trade Feed Tab */}
      {activeTab === 'feed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-gray-500" />
            <span className="text-gray-500 text-sm">Filter:</span>
            {['all', 'buy', 'sell'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterAction(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterAction === f
                    ? f === 'buy' ? 'bg-emerald-500 text-white' : f === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live updates • {filteredTrades.length} verified trades
          </div>

          {/* Trade Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTrades.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 sm:p-5 hover:border-gray-600 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Trade info */}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        trade.action === 'BUY'
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-red-500/20 border border-red-500/30'
                      }`}>
                        {trade.action === 'BUY'
                          ? <ArrowUpRight className="text-emerald-400" size={24} />
                          : <ArrowDownRight className="text-red-400" size={24} />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-bold text-lg">{trade.symbol}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            trade.action === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.action}
                          </span>
                          {trade.verified && (
                            <span className="flex items-center gap-1 text-xs text-blue-400">
                              <CheckCircle size={12} /> Verified
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            trade.status === 'open'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {trade.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {trade.shares} shares @ ${trade.price.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock size={12} />
                          {formatTime(trade.time)}
                        </div>
                      </div>
                    </div>

                    {/* Right: P&L */}
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <div className={`text-lg font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(1)}%
                        </div>
                        <div className="text-gray-500 text-xs">
                          ${(trade.price * trade.shares * (trade.pnl / 100)).toFixed(2)} P&L
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{trade.rationale}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Signals Tab */}
      {activeTab === 'signals' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid gap-4">
            {signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-800/40 border rounded-xl p-4 sm:p-5 ${
                  signal.type === 'entry'
                    ? 'border-emerald-500/30'
                    : signal.type === 'exit'
                    ? 'border-red-500/30'
                    : 'border-yellow-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      signal.type === 'entry'
                        ? 'bg-emerald-500/20'
                        : signal.type === 'exit'
                        ? 'bg-red-500/20'
                        : 'bg-yellow-500/20'
                    }`}>
                      {signal.type === 'entry' && <Target className="text-emerald-400" size={20} />}
                      {signal.type === 'exit' && <DollarSign className="text-red-400" size={20} />}
                      {signal.type === 'alert' && <AlertCircle className="text-yellow-400" size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{signal.symbol}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                          signal.type === 'entry'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : signal.type === 'exit'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {signal.type}
                        </span>
                        {signal.confidence && (
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            signal.confidence === 'high'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {signal.confidence} confidence
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {signal.type === 'entry' && (
                          <>Entry: ${signal.price} • Target: ${signal.target} • Stop: ${signal.stop}</>
                        )}
                        {signal.type === 'exit' && (
                          <>Exit @ ${signal.price} • {signal.reason} • <span className="text-emerald-400">+{signal.pnlPercent}%</span></>
                        )}
                        {signal.type === 'alert' && signal.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(signal.time)}
                  </div>
                </div>
                {signal.rationale && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <p className="text-gray-300 text-sm">{signal.rationale}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl text-center">
            <Bell className="mx-auto mb-2 text-emerald-400" size={24} />
            <p className="text-white font-medium">Get instant alerts</p>
            <p className="text-gray-500 text-sm mt-1">Enable notifications to never miss a trade signal</p>
            <button className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition">
              Enable Push Notifications
            </button>
          </div>
        </motion.div>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item, index) => {
                const data = priceData[item.symbol] || {};
                const isPositive = data.changePercent >= 0;
                return (
                  <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-gray-600 flex items-center justify-center">
                          <span className="text-white font-bold">{item.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{item.symbol}</h3>
                          <p className="text-gray-500 text-sm truncate max-w-[120px]">{item.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => toggleAlerts(item.symbol)}
                          className={`p-2 rounded-lg transition ${item.alerts ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500'}`}
                        >
                          {item.alerts ? <Bell size={16} /> : <BellOff size={16} />}
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(item.symbol)}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${data.price?.toFixed(2) || '—'}
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isPositive ? '+' : ''}{data.changePercent?.toFixed(2) || 0}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-12 text-center">
              <Star className="mx-auto mb-4 text-gray-600" size={48} />
              <h3 className="text-white font-semibold text-lg mb-2">Your watchlist is empty</h3>
              <p className="text-gray-500 mb-6">Add stocks to track their performance</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg transition"
              >
                <Plus size={18} />
                Add Your First Stock
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Add Stock Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Add to Watchlist</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <StockSearch
                  onSelect={addToWatchlist}
                  placeholder="Search for stocks..."
                  showSector
                  autoFocus
                />
              </div>
              <p className="text-gray-500 text-sm text-center">
                Search from 300+ stocks across all sectors
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradeActivity;
