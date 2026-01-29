import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Plus, X, TrendingUp, TrendingDown,
  RefreshCw, Bell, BellOff, Trash2, ArrowUpRight
} from 'lucide-react';
import StockSearch from '../components/StockSearch';

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState({});

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alphahunt_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  // Save watchlist to localStorage
  const saveWatchlist = (list) => {
    localStorage.setItem('alphahunt_watchlist', JSON.stringify(list));
    setWatchlist(list);
  };

  // Fetch prices for watchlist items
  const fetchPrices = useCallback(async () => {
    if (watchlist.length === 0) return;
    setIsLoading(true);

    const prices = {};
    for (const item of watchlist) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${item.symbol}&apikey=${API_KEY}`
        );
        const data = await response.json();
        if (data['Global Quote']) {
          const quote = data['Global Quote'];
          prices[item.symbol] = {
            price: parseFloat(quote['05. price']) || 0,
            change: parseFloat(quote['09. change']) || 0,
            changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
            high: parseFloat(quote['03. high']) || 0,
            low: parseFloat(quote['04. low']) || 0,
            volume: parseInt(quote['06. volume']) || 0,
          };
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error fetching ${item.symbol}:`, error);
      }
    }
    setPriceData(prices);
    setIsLoading(false);
  }, [watchlist]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const addToWatchlist = (stock) => {
    if (!watchlist.find(w => w.symbol === stock.symbol)) {
      const newItem = { ...stock, alerts: false, addedAt: new Date().toISOString() };
      saveWatchlist([...watchlist, newItem]);
    }
    setShowAddModal(false);
  };

  const removeFromWatchlist = (symbol) => {
    saveWatchlist(watchlist.filter(w => w.symbol !== symbol));
  };

  const toggleAlerts = (symbol) => {
    saveWatchlist(watchlist.map(w =>
      w.symbol === symbol ? { ...w, alerts: !w.alerts } : w
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Star className="text-yellow-400" size={28} />
            Watchlist
          </h1>
          <p className="text-gray-500 mt-1">Track your favorite stocks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPrices}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition"
          >
            <Plus size={18} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Watchlist Grid */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {watchlist.map((item, index) => {
              const data = priceData[item.symbol] || {};
              const isPositive = data.changePercent >= 0;

              return (
                <motion.div
                  key={item.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-gray-600 flex items-center justify-center">
                        <span className="text-white font-bold">{item.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{item.symbol}</h3>
                        <p className="text-gray-500 text-sm truncate max-w-[150px]">{item.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => toggleAlerts(item.symbol)}
                        className={`p-2 rounded-lg transition ${item.alerts ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-gray-300'}`}
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
                        <span className="text-gray-500 ml-1">
                          ({isPositive ? '+' : ''}${data.change?.toFixed(2) || 0})
                        </span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition">
                      <ArrowUpRight size={20} />
                    </button>
                  </div>

                  {data.volume && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">High</div>
                        <div className="text-white font-medium">${data.high?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Low</div>
                        <div className="text-white font-medium">${data.low?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Volume</div>
                        <div className="text-white font-medium">{(data.volume / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-12 text-center"
        >
          <Star className="mx-auto mb-4 text-gray-600" size={48} />
          <h3 className="text-white font-semibold text-lg mb-2">No stocks in your watchlist</h3>
          <p className="text-gray-500 mb-6">Start tracking stocks by adding them to your watchlist</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg transition"
          >
            <Plus size={18} />
            Add Your First Stock
          </button>
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
                  placeholder="Search for stocks (e.g., AAPL, Apple)..."
                  showSector
                  autoFocus
                />
              </div>

              <p className="text-gray-500 text-sm text-center">
                Search from 300+ stocks across all major sectors
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Watchlist;
