import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, Plus, X, Save, Trash2, Play, ChevronDown,
  TrendingUp, TrendingDown, DollarSign, BarChart2, Percent,
  Zap, Star, Edit2
} from 'lucide-react';

// Preset screeners
const PRESET_SCREENERS = [
  {
    id: 'momentum',
    name: 'Momentum Plays',
    description: 'Stocks with strong upward momentum',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    filters: { minChange: 3, maxChange: 100, minVolume: 1000000 }
  },
  {
    id: 'value',
    name: 'Value Picks',
    description: 'Undervalued stocks with potential',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-500',
    filters: { minChange: -5, maxChange: 0, minVolume: 500000 }
  },
  {
    id: 'volatility',
    name: 'High Volatility',
    description: 'Stocks with high price swings',
    icon: BarChart2,
    color: 'from-purple-500 to-pink-500',
    filters: { minChange: -10, maxChange: 10, minVolume: 2000000 }
  },
  {
    id: 'breakout',
    name: 'Breakout Candidates',
    description: 'Stocks near 52-week highs',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    filters: { minChange: 2, maxChange: 15, minVolume: 1500000 }
  },
];

// Sample stock data for screening
const SAMPLE_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.3, volume: 45000000, marketCap: 2800, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', price: 378.90, change: 1.8, volume: 22000000, marketCap: 2750, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 495.20, change: 5.2, volume: 38000000, marketCap: 1200, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla', price: 248.30, change: -2.1, volume: 95000000, marketCap: 780, sector: 'Automotive' },
  { symbol: 'AMD', name: 'AMD', price: 142.80, change: 4.5, volume: 55000000, marketCap: 230, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet', price: 139.50, change: 0.8, volume: 18000000, marketCap: 1750, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon', price: 154.20, change: 1.2, volume: 35000000, marketCap: 1600, sector: 'Consumer' },
  { symbol: 'META', name: 'Meta', price: 356.70, change: 3.4, volume: 15000000, marketCap: 920, sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix', price: 478.90, change: -1.5, volume: 8000000, marketCap: 210, sector: 'Entertainment' },
  { symbol: 'JPM', name: 'JPMorgan', price: 172.40, change: 0.5, volume: 12000000, marketCap: 500, sector: 'Finance' },
  { symbol: 'V', name: 'Visa', price: 268.30, change: 1.1, volume: 6000000, marketCap: 550, sector: 'Finance' },
  { symbol: 'UNH', name: 'UnitedHealth', price: 528.60, change: -0.8, volume: 3500000, marketCap: 490, sector: 'Healthcare' },
];

const Screeners = () => {
  const [activeScreener, setActiveScreener] = useState(null);
  const [customScreeners, setCustomScreeners] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const [newScreener, setNewScreener] = useState({
    name: '',
    description: '',
    filters: {
      minPrice: '',
      maxPrice: '',
      minChange: '',
      maxChange: '',
      minVolume: '',
      sectors: [],
    }
  });

  // Load custom screeners from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alphahunt_screeners');
    if (saved) {
      setCustomScreeners(JSON.parse(saved));
    }
  }, []);

  // Save custom screeners
  const saveScreeners = (screeners) => {
    localStorage.setItem('alphahunt_screeners', JSON.stringify(screeners));
    setCustomScreeners(screeners);
  };

  // Run screener
  const runScreener = (screener) => {
    setIsRunning(true);
    setActiveScreener(screener);

    setTimeout(() => {
      const filters = screener.filters || {};
      const results = SAMPLE_STOCKS.filter(stock => {
        if (filters.minPrice && stock.price < filters.minPrice) return false;
        if (filters.maxPrice && stock.price > filters.maxPrice) return false;
        if (filters.minChange && stock.change < filters.minChange) return false;
        if (filters.maxChange && stock.change > filters.maxChange) return false;
        if (filters.minVolume && stock.volume < filters.minVolume) return false;
        if (filters.sectors?.length > 0 && !filters.sectors.includes(stock.sector)) return false;
        return true;
      });

      setFilteredStocks(results);
      setIsRunning(false);
    }, 800);
  };

  // Create new screener
  const createScreener = () => {
    if (!newScreener.name) return;

    const screener = {
      id: Date.now(),
      ...newScreener,
      icon: Filter,
      color: 'from-gray-500 to-gray-600',
      createdAt: new Date().toISOString(),
    };

    saveScreeners([...customScreeners, screener]);
    setShowCreateModal(false);
    setNewScreener({
      name: '',
      description: '',
      filters: { minPrice: '', maxPrice: '', minChange: '', maxChange: '', minVolume: '', sectors: [] }
    });
  };

  // Delete custom screener
  const deleteScreener = (id) => {
    saveScreeners(customScreeners.filter(s => s.id !== id));
    if (activeScreener?.id === id) {
      setActiveScreener(null);
      setFilteredStocks([]);
    }
  };

  const sectors = ['Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Automotive', 'Entertainment'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Filter className="text-purple-400" size={28} />
            Screeners
          </h1>
          <p className="text-gray-500 mt-1">Find stocks that match your criteria</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          Create Screener
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Screener List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Preset Screeners */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Preset Screeners</h2>
            <div className="space-y-3">
              {PRESET_SCREENERS.map((screener) => (
                <motion.button
                  key={screener.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => runScreener(screener)}
                  className={`w-full p-4 rounded-xl border transition text-left ${
                    activeScreener?.id === screener.id
                      ? 'bg-gray-800 border-purple-500/50'
                      : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${screener.color} flex items-center justify-center`}>
                      <screener.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{screener.name}</h3>
                      <p className="text-gray-500 text-sm">{screener.description}</p>
                    </div>
                    <Play size={16} className="text-gray-500" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Screeners */}
          {customScreeners.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">My Screeners</h2>
              <div className="space-y-3">
                {customScreeners.map((screener) => (
                  <motion.div
                    key={screener.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border transition ${
                      activeScreener?.id === screener.id
                        ? 'bg-gray-800 border-purple-500/50'
                        : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                        <Star size={20} className="text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{screener.name}</h3>
                        <p className="text-gray-500 text-sm">{screener.description || 'Custom screener'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => runScreener(screener)}
                          className="p-2 text-gray-400 hover:text-emerald-400 transition"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => deleteScreener(screener.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden">
            {activeScreener ? (
              <>
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{activeScreener.name}</h3>
                    <p className="text-gray-500 text-sm">{filteredStocks.length} stocks found</p>
                  </div>
                  {isRunning && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Scanning...
                    </div>
                  )}
                </div>

                {filteredStocks.length > 0 ? (
                  <div className="divide-y divide-gray-700/50">
                    {filteredStocks.map((stock, i) => (
                      <motion.div
                        key={stock.symbol}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 hover:bg-gray-700/20 transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-gray-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="text-white font-semibold">{stock.symbol}</div>
                            <div className="text-gray-500 text-sm">{stock.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <div className="text-gray-500 text-xs">Sector</div>
                            <div className="text-white text-sm">{stock.sector}</div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-gray-500 text-xs">Volume</div>
                            <div className="text-white text-sm">{(stock.volume / 1000000).toFixed(1)}M</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">${stock.price.toFixed(2)}</div>
                            <div className={`text-sm font-medium flex items-center gap-1 justify-end ${
                              stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : !isRunning && (
                  <div className="p-12 text-center text-gray-500">
                    No stocks match your criteria
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center">
                <Filter className="mx-auto mb-4 text-gray-600" size={48} />
                <h3 className="text-white font-semibold mb-2">Select a Screener</h3>
                <p className="text-gray-500">Choose a preset or create your own custom screener</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Screener Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Screener</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={newScreener.name}
                    onChange={(e) => setNewScreener({ ...newScreener, name: e.target.value })}
                    placeholder="My Custom Screener"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <input
                    type="text"
                    value={newScreener.description}
                    onChange={(e) => setNewScreener({ ...newScreener, description: e.target.value })}
                    placeholder="Optional description"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Min Price ($)</label>
                    <input
                      type="number"
                      value={newScreener.filters.minPrice}
                      onChange={(e) => setNewScreener({
                        ...newScreener,
                        filters: { ...newScreener.filters, minPrice: e.target.value }
                      })}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Max Price ($)</label>
                    <input
                      type="number"
                      value={newScreener.filters.maxPrice}
                      onChange={(e) => setNewScreener({
                        ...newScreener,
                        filters: { ...newScreener.filters, maxPrice: e.target.value }
                      })}
                      placeholder="1000"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Min Change (%)</label>
                    <input
                      type="number"
                      value={newScreener.filters.minChange}
                      onChange={(e) => setNewScreener({
                        ...newScreener,
                        filters: { ...newScreener.filters, minChange: e.target.value }
                      })}
                      placeholder="-100"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Max Change (%)</label>
                    <input
                      type="number"
                      value={newScreener.filters.maxChange}
                      onChange={(e) => setNewScreener({
                        ...newScreener,
                        filters: { ...newScreener.filters, maxChange: e.target.value }
                      })}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Min Volume</label>
                  <input
                    type="number"
                    value={newScreener.filters.minVolume}
                    onChange={(e) => setNewScreener({
                      ...newScreener,
                      filters: { ...newScreener.filters, minVolume: e.target.value }
                    })}
                    placeholder="1000000"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sectors</label>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map((sector) => (
                      <button
                        key={sector}
                        onClick={() => {
                          const current = newScreener.filters.sectors || [];
                          const updated = current.includes(sector)
                            ? current.filter(s => s !== sector)
                            : [...current, sector];
                          setNewScreener({
                            ...newScreener,
                            filters: { ...newScreener.filters, sectors: updated }
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          newScreener.filters.sectors?.includes(sector)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createScreener}
                  disabled={!newScreener.name}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
                >
                  <Save size={18} />
                  Save Screener
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Screeners;
