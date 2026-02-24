import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, ChevronDown, ChevronUp, Search, X, RotateCcw,
  TrendingUp, TrendingDown, BarChart2, Activity, Zap,
  Shield, Newspaper, Users, Layers, DollarSign,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronRight
} from 'lucide-react';
import { STOCKS, SECTORS } from '../data/stockDatabase';
import ChartModal from '../components/ChartModal';

// Seed-based random for consistent simulated data per stock
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Generate simulated market data for each stock
const generateStockData = () => {
  return STOCKS.map((stock, i) => {
    const rng = seededRandom(i * 137 + stock.symbol.charCodeAt(0) * 31);

    const basePrice = (() => {
      if (stock.marketCap === 'Mega') return 150 + rng() * 400;
      if (stock.marketCap === 'Large') return 50 + rng() * 300;
      if (stock.marketCap === 'Mid') return 20 + rng() * 200;
      return 5 + rng() * 80;
    })();

    const price = parseFloat(basePrice.toFixed(2));
    const change = parseFloat(((rng() - 0.45) * 12).toFixed(2));
    const changePercent = parseFloat(((change / price) * 100).toFixed(2));
    const volume = Math.floor((rng() * 80 + 1) * 1000000);
    const avgVolume = Math.floor(volume * (0.7 + rng() * 0.6));

    // Technical indicators
    const rsi = parseFloat((20 + rng() * 60).toFixed(1));
    const sma20 = parseFloat((price * (0.92 + rng() * 0.16)).toFixed(2));
    const sma50 = parseFloat((price * (0.88 + rng() * 0.24)).toFixed(2));
    const sma200 = parseFloat((price * (0.80 + rng() * 0.40)).toFixed(2));
    const macdSignal = rng() > 0.5 ? 'Bullish' : 'Bearish';
    const aboveSMA20 = price > sma20;
    const aboveSMA50 = price > sma50;
    const aboveSMA200 = price > sma200;
    const goldenCross = sma50 > sma200;

    // Chart patterns
    const patterns = ['None', 'Cup & Handle', 'Head & Shoulders', 'Double Bottom',
      'Double Top', 'Ascending Triangle', 'Descending Triangle', 'Bull Flag',
      'Bear Flag', 'Wedge', 'Channel Up', 'Channel Down', 'Breakout'];
    const pattern = patterns[Math.floor(rng() * patterns.length)];

    // Insider activity
    const insiderActions = ['None', 'Insider Buying', 'Insider Selling', 'Cluster Buying',
      'CEO Purchase', 'CFO Sale', 'Director Purchase', 'Large Sale'];
    const insiderActivity = insiderActions[Math.floor(rng() * insiderActions.length)];
    const insiderBuying = insiderActivity.includes('Buy') || insiderActivity.includes('Purchase');

    // Sentiment
    const sentiments = ['Very Bullish', 'Bullish', 'Neutral', 'Bearish', 'Very Bearish'];
    const sentiment = sentiments[Math.floor(rng() * sentiments.length)];
    const newsCount = Math.floor(rng() * 20);

    // Volatility
    const beta = parseFloat((0.3 + rng() * 2).toFixed(2));

    // Performance
    const perf1M = parseFloat(((rng() - 0.45) * 20).toFixed(2));
    const perfYTD = parseFloat(((rng() - 0.35) * 50).toFixed(2));

    // Valuation
    const peRatio = parseFloat((8 + rng() * 60).toFixed(1));

    // Market cap value in billions
    const mcapValue = (() => {
      if (stock.marketCap === 'Mega') return 500 + rng() * 2500;
      if (stock.marketCap === 'Large') return 50 + rng() * 450;
      if (stock.marketCap === 'Mid') return 5 + rng() * 45;
      return 0.5 + rng() * 4.5;
    })();

    return {
      ...stock,
      price, change, changePercent, volume, avgVolume,
      rsi, sma20, sma50, sma200, macdSignal, aboveSMA20, aboveSMA50, aboveSMA200, goldenCross,
      pattern, insiderActivity, insiderBuying, sentiment, newsCount,
      beta, perf1M, perfYTD, peRatio,
      mcapValue: parseFloat(mcapValue.toFixed(2)),
    };
  });
};

// Filter category definitions
const FILTER_CATEGORIES = [
  {
    id: 'technical',
    label: 'Technical Analysis',
    icon: Activity,
    color: 'text-blue-400',
    filters: [
      { id: 'rsi_oversold', label: 'RSI Oversold (<30)', apply: (s) => s.rsi < 30 },
      { id: 'rsi_overbought', label: 'RSI Overbought (>70)', apply: (s) => s.rsi > 70 },
      { id: 'rsi_neutral', label: 'RSI Neutral (30-70)', apply: (s) => s.rsi >= 30 && s.rsi <= 70 },
      { id: 'macd_bullish', label: 'MACD Bullish', apply: (s) => s.macdSignal === 'Bullish' },
      { id: 'macd_bearish', label: 'MACD Bearish', apply: (s) => s.macdSignal === 'Bearish' },
      { id: 'above_sma20', label: 'Above SMA 20', apply: (s) => s.aboveSMA20 },
      { id: 'above_sma50', label: 'Above SMA 50', apply: (s) => s.aboveSMA50 },
      { id: 'above_sma200', label: 'Above SMA 200', apply: (s) => s.aboveSMA200 },
      { id: 'golden_cross', label: 'Golden Cross', apply: (s) => s.goldenCross },
      { id: 'death_cross', label: 'Death Cross', apply: (s) => !s.goldenCross },
    ]
  },
  {
    id: 'patterns',
    label: 'Chart Patterns',
    icon: BarChart2,
    color: 'text-purple-400',
    filters: [
      { id: 'pat_cup', label: 'Cup & Handle', apply: (s) => s.pattern === 'Cup & Handle' },
      { id: 'pat_hs', label: 'Head & Shoulders', apply: (s) => s.pattern === 'Head & Shoulders' },
      { id: 'pat_dblbot', label: 'Double Bottom', apply: (s) => s.pattern === 'Double Bottom' },
      { id: 'pat_dbltop', label: 'Double Top', apply: (s) => s.pattern === 'Double Top' },
      { id: 'pat_tri_up', label: 'Ascending Triangle', apply: (s) => s.pattern === 'Ascending Triangle' },
      { id: 'pat_bull_flag', label: 'Bull Flag', apply: (s) => s.pattern === 'Bull Flag' },
      { id: 'pat_breakout', label: 'Breakout', apply: (s) => s.pattern === 'Breakout' },
      { id: 'pat_any', label: 'Any Pattern Detected', apply: (s) => s.pattern !== 'None' },
    ]
  },
  {
    id: 'insider',
    label: 'Insider Trading',
    icon: Users,
    color: 'text-yellow-400',
    filters: [
      { id: 'insider_buying', label: 'Insider Buying', apply: (s) => s.insiderBuying },
      { id: 'insider_selling', label: 'Insider Selling', apply: (s) => s.insiderActivity.includes('Sell') || s.insiderActivity.includes('Sale') },
      { id: 'insider_cluster', label: 'Cluster Buying', apply: (s) => s.insiderActivity === 'Cluster Buying' },
      { id: 'insider_ceo', label: 'CEO Activity', apply: (s) => s.insiderActivity.includes('CEO') },
      { id: 'insider_any', label: 'Any Insider Activity', apply: (s) => s.insiderActivity !== 'None' },
    ]
  },
  {
    id: 'sentiment',
    label: 'News & Sentiment',
    icon: Newspaper,
    color: 'text-emerald-400',
    filters: [
      { id: 'sent_very_bull', label: 'Very Bullish', apply: (s) => s.sentiment === 'Very Bullish' },
      { id: 'sent_bullish', label: 'Bullish', apply: (s) => s.sentiment === 'Bullish' || s.sentiment === 'Very Bullish' },
      { id: 'sent_bearish', label: 'Bearish', apply: (s) => s.sentiment === 'Bearish' || s.sentiment === 'Very Bearish' },
      { id: 'sent_neutral', label: 'Neutral', apply: (s) => s.sentiment === 'Neutral' },
      { id: 'news_heavy', label: 'Heavy News (10+ articles)', apply: (s) => s.newsCount >= 10 },
    ]
  },
  {
    id: 'sector',
    label: 'Sector',
    icon: Layers,
    color: 'text-orange-400',
    filters: SECTORS.map(sector => ({
      id: `sector_${sector.toLowerCase().replace(/\s/g, '_')}`,
      label: sector,
      apply: (s) => s.sector === sector,
    }))
  },
  {
    id: 'price',
    label: 'Price & Valuation',
    icon: DollarSign,
    color: 'text-cyan-400',
    filters: [
      { id: 'price_under10', label: 'Under $10', apply: (s) => s.price < 10 },
      { id: 'price_10_50', label: '$10 - $50', apply: (s) => s.price >= 10 && s.price <= 50 },
      { id: 'price_50_150', label: '$50 - $150', apply: (s) => s.price >= 50 && s.price <= 150 },
      { id: 'price_150_500', label: '$150 - $500', apply: (s) => s.price >= 150 && s.price <= 500 },
      { id: 'price_over500', label: 'Over $500', apply: (s) => s.price > 500 },
      { id: 'pe_low', label: 'Low P/E (<15)', apply: (s) => s.peRatio < 15 },
      { id: 'pe_high', label: 'High P/E (>40)', apply: (s) => s.peRatio > 40 },
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Zap,
    color: 'text-pink-400',
    filters: [
      { id: 'perf_up_today', label: 'Up Today', apply: (s) => s.change > 0 },
      { id: 'perf_down_today', label: 'Down Today', apply: (s) => s.change < 0 },
      { id: 'perf_up_5pct', label: 'Up >5% Today', apply: (s) => s.changePercent > 5 },
      { id: 'perf_1m_pos', label: '1M Positive', apply: (s) => s.perf1M > 0 },
      { id: 'perf_ytd_pos', label: 'YTD Positive', apply: (s) => s.perfYTD > 0 },
      { id: 'perf_ytd_20', label: 'YTD >20%', apply: (s) => s.perfYTD > 20 },
    ]
  },
  {
    id: 'volatility',
    label: 'Volatility & Volume',
    icon: Shield,
    color: 'text-red-400',
    filters: [
      { id: 'vol_high', label: 'High Volume (>Avg)', apply: (s) => s.volume > s.avgVolume },
      { id: 'vol_spike', label: 'Volume Spike (>2x Avg)', apply: (s) => s.volume > s.avgVolume * 2 },
      { id: 'beta_low', label: 'Low Beta (<0.8)', apply: (s) => s.beta < 0.8 },
      { id: 'beta_high', label: 'High Beta (>1.5)', apply: (s) => s.beta > 1.5 },
      { id: 'mcap_mega', label: 'Mega Cap', apply: (s) => s.marketCap === 'Mega' },
      { id: 'mcap_large', label: 'Large Cap', apply: (s) => s.marketCap === 'Large' },
      { id: 'mcap_mid', label: 'Mid Cap', apply: (s) => s.marketCap === 'Mid' },
      { id: 'mcap_small', label: 'Small Cap', apply: (s) => s.marketCap === 'Small' },
    ]
  },
];

const TABLE_COLUMNS = [
  { id: 'symbol', label: 'Symbol', sortKey: 'symbol' },
  { id: 'price', label: 'Price', sortKey: 'price', align: 'right' },
  { id: 'change', label: 'Change', sortKey: 'changePercent', align: 'right' },
  { id: 'volume', label: 'Volume', sortKey: 'volume', align: 'right' },
  { id: 'mcap', label: 'Mkt Cap', sortKey: 'mcapValue', align: 'right' },
  { id: 'rsi', label: 'RSI', sortKey: 'rsi', align: 'center' },
  { id: 'pattern', label: 'Pattern', sortKey: 'pattern' },
  { id: 'sentiment', label: 'Sentiment', sortKey: 'sentiment' },
  { id: 'perf1M', label: '1M', sortKey: 'perf1M', align: 'right' },
  { id: 'perfYTD', label: 'YTD', sortKey: 'perfYTD', align: 'right' },
];

const Screeners = () => {
  const [allStocks] = useState(() => generateStockData());
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'mcapValue', direction: 'desc' });
  const [expandedCategories, setExpandedCategories] = useState(['technical']);
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [chartSymbol, setChartSymbol] = useState(null);
  const [chartStockName, setChartStockName] = useState('');

  // Filter logic: OR within same category, AND across categories
  const filteredStocks = useMemo(() => {
    let result = allStocks;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
      );
    }

    if (activeFilters.length > 0) {
      const filtersByCategory = {};
      activeFilters.forEach(filterId => {
        for (const cat of FILTER_CATEGORIES) {
          const found = cat.filters.find(f => f.id === filterId);
          if (found) {
            if (!filtersByCategory[cat.id]) filtersByCategory[cat.id] = [];
            filtersByCategory[cat.id].push(found);
            break;
          }
        }
      });

      result = result.filter(stock =>
        Object.values(filtersByCategory).every(catFilters =>
          catFilters.some(f => f.apply(stock))
        )
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [allStocks, activeFilters, searchQuery, sortConfig]);

  useEffect(() => { setPage(0); }, [activeFilters, searchQuery, sortConfig]);

  const paginatedStocks = filteredStocks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredStocks.length / PAGE_SIZE);

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]);
  };

  const clearFilters = () => { setActiveFilters([]); setSearchQuery(''); };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={12} className="text-gray-600" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={12} className="text-emerald-400" />
      : <ArrowDown size={12} className="text-emerald-400" />;
  };

  const formatVolume = (vol) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    return `${(vol / 1e3).toFixed(0)}K`;
  };

  const formatMcap = (val) => val >= 1000 ? `$${(val / 1000).toFixed(1)}T` : `$${val.toFixed(0)}B`;

  const sentimentColors = {
    'Very Bullish': 'text-emerald-400 bg-emerald-500/20',
    'Bullish': 'text-emerald-300 bg-emerald-500/10',
    'Neutral': 'text-gray-400 bg-gray-500/20',
    'Bearish': 'text-red-300 bg-red-500/10',
    'Very Bearish': 'text-red-400 bg-red-500/20',
  };

  const rsiColor = (rsi) => rsi < 30 ? 'text-red-400' : rsi > 70 ? 'text-emerald-400' : 'text-gray-300';

  const activeFilterCount = activeFilters.length;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Filter className="text-purple-400" size={28} />
            Stock Screener
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredStocks.length} of {allStocks.length} stocks
            {activeFilterCount > 0 && ` \u2022 ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm">
              <RotateCcw size={16} /> Clear All
            </button>
          )}
          {/* Desktop filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${showFilters ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
          </button>
          {/* Mobile filter button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${activeFilterCount > 0 ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-4 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Filter className="text-purple-400" size={20} />
                  <h3 className="text-lg font-bold text-white">Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount} active</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-gray-800">
                      Clear
                    </button>
                  )}
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 text-gray-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Search in modal */}
              <div className="px-4 py-3 border-b border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Active filter tags */}
              {activeFilterCount > 0 && (
                <div className="px-4 py-3 border-b border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map(filterId => {
                      let label = filterId;
                      for (const cat of FILTER_CATEGORIES) {
                        const found = cat.filters.find(f => f.id === filterId);
                        if (found) { label = found.label; break; }
                      }
                      return (
                        <button key={filterId} onClick={() => toggleFilter(filterId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/30 text-purple-300 rounded-lg text-xs hover:bg-purple-500/50 transition">
                          {label} <X size={12} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter categories - scrollable */}
              <div className="overflow-y-auto max-h-[calc(85vh-180px)] pb-6">
                {FILTER_CATEGORIES.map((category) => {
                  const isExpanded = expandedCategories.includes(category.id);
                  const activeCatCount = activeFilters.filter(f => category.filters.some(cf => cf.id === f)).length;

                  return (
                    <div key={category.id} className="border-b border-gray-800 last:border-b-0">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-800/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <category.icon size={20} className={category.color} />
                          <span className="text-white font-medium">{category.label}</span>
                          {activeCatCount > 0 && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">{activeCatCount}</span>
                          )}
                        </div>
                        <ChevronRight size={20} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-gray-800/30"
                          >
                            <div className="px-4 py-2 grid grid-cols-2 gap-2">
                              {category.filters.map((filter) => (
                                <button
                                  key={filter.id}
                                  onClick={() => toggleFilter(filter.id)}
                                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition ${
                                    activeFilters.includes(filter.id)
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  }`}
                                >
                                  {filter.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Apply button */}
              <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-4 py-4 safe-area-bottom">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition"
                >
                  View {filteredStocks.length} Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-hidden hidden lg:block"
            >
              <div className="w-[280px] space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto pr-2 pb-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Active filter tags */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    {activeFilters.map(filterId => {
                      let label = filterId;
                      for (const cat of FILTER_CATEGORIES) {
                        const found = cat.filters.find(f => f.id === filterId);
                        if (found) { label = found.label; break; }
                      }
                      return (
                        <button key={filterId} onClick={() => toggleFilter(filterId)}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-500/30 text-purple-300 rounded text-xs hover:bg-purple-500/50 transition">
                          {label} <X size={10} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Filter categories */}
                {FILTER_CATEGORIES.map((category) => {
                  const isExpanded = expandedCategories.includes(category.id);
                  const activeCatCount = activeFilters.filter(f => category.filters.some(cf => cf.id === f)).length;

                  return (
                    <div key={category.id} className="bg-gray-800/40 border border-gray-700/50 rounded-lg overflow-hidden">
                      <button onClick={() => toggleCategory(category.id)} className="w-full flex items-center justify-between p-3 hover:bg-gray-700/30 transition">
                        <div className="flex items-center gap-2">
                          <category.icon size={16} className={category.color} />
                          <span className="text-white text-sm font-medium">{category.label}</span>
                          {activeCatCount > 0 && (
                            <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeCatCount}</span>
                          )}
                        </div>
                        <ChevronRight size={16} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 space-y-1">
                              {category.filters.map((filter) => (
                                <button
                                  key={filter.id}
                                  onClick={() => toggleFilter(filter.id)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                    activeFilters.includes(filter.id)
                                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                  }`}
                                >
                                  {filter.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stock Table */}
        <div className="flex-1 min-w-0">
          {/* Mobile search */}
          <div className="lg:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    {TABLE_COLUMNS.map((col) => (
                      <th key={col.id} onClick={() => handleSort(col.sortKey)}
                        className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition whitespace-nowrap ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}>
                        <span className="inline-flex items-center gap-1">
                          {col.label} <SortIcon columnKey={col.sortKey} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {paginatedStocks.map((stock, i) => (
                    <motion.tr key={stock.symbol}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.4) }}
                      className="hover:bg-gray-700/20 transition cursor-pointer"
                      onClick={() => { setChartSymbol(stock.symbol); setChartStockName(stock.name); }}>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-gray-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-[10px]">{stock.symbol.slice(0, 3)}</span>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">{stock.symbol}</div>
                            <div className="text-gray-500 text-xs truncate max-w-[120px]">{stock.name}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right text-white font-medium text-sm">${stock.price.toFixed(2)}</td>

                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stock.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-gray-400 text-sm">{formatVolume(stock.volume)}</td>

                      <td className="px-4 py-3 text-right text-gray-400 text-sm">{formatMcap(stock.mcapValue)}</td>

                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-medium ${rsiColor(stock.rsi)}`}>{stock.rsi}</span>
                      </td>

                      <td className="px-4 py-3">
                        {stock.pattern !== 'None' ? (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg whitespace-nowrap">{stock.pattern}</span>
                        ) : <span className="text-gray-600 text-xs">&mdash;</span>}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg whitespace-nowrap ${sentimentColors[stock.sentiment]}`}>{stock.sentiment}</span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm ${stock.perf1M >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stock.perf1M >= 0 ? '+' : ''}{stock.perf1M.toFixed(1)}%
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm ${stock.perfYTD >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stock.perfYTD >= 0 ? '+' : ''}{stock.perfYTD.toFixed(1)}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-700/50">
                <span className="text-gray-500 text-sm">
                  Showing {page * PAGE_SIZE + 1}&ndash;{Math.min((page + 1) * PAGE_SIZE, filteredStocks.length)} of {filteredStocks.length}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-40 transition">
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = page < 3 ? i : page - 2 + i;
                    if (p >= totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${page === p ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                        {p + 1}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-40 transition">
                    Next
                  </button>
                </div>
              </div>
            )}

            {filteredStocks.length === 0 && (
              <div className="p-12 text-center">
                <Filter className="mx-auto mb-4 text-gray-600" size={48} />
                <h3 className="text-white font-semibold mb-2">No stocks match your criteria</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {chartSymbol && (
          <ChartModal
            symbol={chartSymbol}
            stockName={chartStockName}
            onClose={() => { setChartSymbol(null); setChartStockName(''); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Screeners;
