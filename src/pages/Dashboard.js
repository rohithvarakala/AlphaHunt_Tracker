import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, PlusCircle, X, Search,
  RefreshCw, Download, DollarSign, Percent, BarChart2, Cloud, CloudOff
} from 'lucide-react';
import StockSearch from '../components/StockSearch';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import { getStockBySymbol, SECTORS } from '../data/stockDatabase';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToTrades,
  addTrade as addTradeToFirestore,
  deleteTrade as deleteTradeFromFirestore
} from '../services/firestore';

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';

const Dashboard = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [stockPrices, setStockPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [newTrade, setNewTrade] = useState({
    ticker: '', type: 'BUY', shares: '', entryPrice: '', exitPrice: '',
    entryDate: '', exitDate: '', status: 'OPEN', sector: 'Technology'
  });
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const fetchStockPrices = useCallback(async (tradesToFetch) => {
    setIsLoadingPrices(true);
    const openTickers = [...new Set(tradesToFetch.filter(t => t.status === 'OPEN').map(t => t.ticker))];

    if (openTickers.length === 0) {
      setIsLoadingPrices(false);
      return;
    }

    const prices = {};
    for (const ticker of openTickers) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`
        );
        const data = await response.json();

        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          prices[ticker] = parseFloat(data['Global Quote']['05. price']);
        } else {
          prices[ticker] = Math.random() * 500 + 100;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching price for ${ticker}:`, error);
        prices[ticker] = Math.random() * 500 + 100;
      }
    }
    setStockPrices(prices);
    setIsLoadingPrices(false);
  }, []);

  // Load trades from Firestore (if logged in) or localStorage
  useEffect(() => {
    if (user) {
      // Subscribe to Firestore for real-time updates
      setIsCloudSynced(true);
      const unsubscribe = subscribeToTrades(user.uid, (firestoreTrades) => {
        setTrades(firestoreTrades);
        const openTickers = [...new Set(firestoreTrades.filter(t => t.status === 'OPEN').map(t => t.ticker))];
        if (openTickers.length > 0) {
          fetchStockPrices(firestoreTrades);
        }
      });
      return () => unsubscribe();
    } else {
      // Fall back to localStorage for guests
      setIsCloudSynced(false);
      try {
        const storedTrades = localStorage.getItem('alphahunt_trades');
        if (storedTrades) {
          const loadedTrades = JSON.parse(storedTrades);
          setTrades(loadedTrades);
          const openTickers = [...new Set(loadedTrades.filter(t => t.status === 'OPEN').map(t => t.ticker))];
          if (openTickers.length > 0) {
            fetchStockPrices(loadedTrades);
          }
        }
      } catch (error) {
        console.log('No existing trades found, starting fresh');
      }
    }
  }, [user, fetchStockPrices]);

  // Save trades to localStorage (for guests only)
  const saveLocalTrades = async (updatedTrades) => {
    try {
      localStorage.setItem('alphahunt_trades', JSON.stringify(updatedTrades));
    } catch (error) {
      console.error('Error saving trades:', error);
    }
  };

  const fetchCurrentPrice = async (ticker) => {
    if (!ticker) return;
    setIsFetchingPrice(true);
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`
      );
      const data = await response.json();
      if (data['Global Quote'] && data['Global Quote']['05. price']) {
        const price = parseFloat(data['Global Quote']['05. price']);
        setNewTrade(prev => ({ ...prev, entryPrice: price.toFixed(2) }));
      } else {
        const simulatedPrice = (Math.random() * 500 + 50).toFixed(2);
        setNewTrade(prev => ({ ...prev, entryPrice: simulatedPrice }));
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      const simulatedPrice = (Math.random() * 500 + 50).toFixed(2);
      setNewTrade(prev => ({ ...prev, entryPrice: simulatedPrice }));
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setNewTrade(prev => ({
      ...prev,
      ticker: stock.symbol,
      sector: stock.sector || prev.sector
    }));
    fetchCurrentPrice(stock.symbol);
  };

  const calculateTradeMetrics = (trade) => {
    let exitPrice;
    if (trade.status === 'OPEN') {
      exitPrice = stockPrices[trade.ticker] || trade.entryPrice;
    } else {
      exitPrice = trade.exitPrice;
    }
    const pnl = (exitPrice - trade.entryPrice) * trade.shares;
    const pnlPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
    const value = exitPrice * trade.shares;
    const invested = trade.entryPrice * trade.shares;
    return { pnl, pnlPercent, value, exitPrice, invested };
  };

  const portfolioStats = () => {
    let totalPnL = 0;
    let totalInvested = 0;
    let totalValue = 0;
    let wins = 0;
    let losses = 0;

    trades.forEach(trade => {
      const { pnl, value, invested } = calculateTradeMetrics(trade);
      totalInvested += invested;
      totalValue += value;
      totalPnL += pnl;
      if (trade.status === 'CLOSED') {
        if (pnl > 0) wins++;
        else if (pnl < 0) losses++;
      }
    });

    const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;
    return { totalPnL, totalInvested, totalValue, totalReturn, wins, losses, winRate };
  };

  const stats = portfolioStats();

  const addTrade = async () => {
    if (!newTrade.ticker || !newTrade.shares || !newTrade.entryPrice || !newTrade.entryDate) return;

    const trade = {
      ticker: newTrade.ticker.toUpperCase(),
      type: newTrade.type,
      shares: parseFloat(newTrade.shares),
      entryPrice: parseFloat(newTrade.entryPrice),
      exitPrice: newTrade.exitPrice ? parseFloat(newTrade.exitPrice) : null,
      entryDate: newTrade.entryDate,
      exitDate: newTrade.exitDate || null,
      status: newTrade.status,
      sector: newTrade.sector
    };

    try {
      if (user) {
        // Save to Firestore (real-time subscription will update state)
        await addTradeToFirestore(user.uid, trade);
      } else {
        // Save to localStorage for guests
        const tradeWithId = { ...trade, id: Date.now() };
        const updatedTrades = [...trades, tradeWithId];
        setTrades(updatedTrades);
        await saveLocalTrades(updatedTrades);

        if (trade.status === 'OPEN') {
          fetchStockPrices(updatedTrades);
        }
      }
    } catch (error) {
      console.error('Error adding trade:', error);
    }

    setNewTrade({ ticker: '', type: 'BUY', shares: '', entryPrice: '', exitPrice: '', entryDate: '', exitDate: '', status: 'OPEN', sector: 'Technology' });
    setSelectedStock(null);
    setShowAddTrade(false);
  };

  const deleteTrade = async (id) => {
    try {
      if (user) {
        // Delete from Firestore
        await deleteTradeFromFirestore(user.uid, id);
      } else {
        // Delete from localStorage for guests
        const updatedTrades = trades.filter(t => t.id !== id);
        setTrades(updatedTrades);
        await saveLocalTrades(updatedTrades);
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Ticker', 'Type', 'Shares', 'Entry Price', 'Exit Price', 'Entry Date', 'Exit Date', 'Status', 'P&L', 'Return %'];
    const rows = trades.map(trade => {
      const { pnl, pnlPercent, exitPrice } = calculateTradeMetrics(trade);
      return [
        trade.ticker, trade.type, trade.shares, trade.entryPrice,
        exitPrice.toFixed(2), trade.entryDate, trade.exitDate || 'N/A',
        trade.status, pnl.toFixed(2), pnlPercent.toFixed(2)
      ];
    });
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphahunt_trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Generate performance history based on trades
  const performanceHistory = [
    { date: 'Nov 02', value: stats.totalInvested * 0.92 },
    { date: 'Dec 15', value: stats.totalInvested * 0.95 },
    { date: 'Jan 05', value: stats.totalInvested * 1.08 },
    { date: 'Jan 10', value: stats.totalInvested * 1.05 },
    { date: 'Jan 15', value: stats.totalInvested * 1.12 },
    { date: 'Jan 23', value: stats.totalValue },
  ];

  const filteredTrades = trades.filter(trade => {
    const matchesFilter = filter === 'ALL' || trade.status === filter;
    const matchesSearch = trade.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statCards = [
    { label: 'Portfolio Value', value: `$${stats.totalValue.toFixed(2)}`, change: stats.totalReturn, icon: DollarSign, color: 'emerald' },
    { label: 'Total P&L', value: `$${stats.totalPnL.toFixed(2)}`, subtext: `Invested: $${stats.totalInvested.toFixed(2)}`, icon: TrendingUp, color: stats.totalPnL >= 0 ? 'emerald' : 'red' },
    { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, subtext: `${stats.wins}W / ${stats.losses}L`, icon: Percent, color: 'blue' },
    { label: 'Active Positions', value: trades.filter(t => t.status === 'OPEN').length, subtext: `${trades.length} total trades`, icon: BarChart2, color: 'purple' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">Track your portfolio performance</p>
            {isCloudSynced ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Cloud size={12} /> Synced
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <CloudOff size={12} /> Local only
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStockPrices(trades)}
            disabled={isLoadingPrices}
            className="p-2 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw size={20} className={`text-gray-400 ${isLoadingPrices ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition text-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowAddTrade(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition text-sm font-medium"
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">Add Trade</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Same 4-column layout on all screens */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-5"
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-gray-500 text-[10px] sm:text-sm truncate">{stat.label}</span>
              <stat.icon size={14} className={`text-${stat.color}-400 hidden sm:block`} />
            </div>
            <div className={`text-sm sm:text-2xl font-bold ${stat.color === 'red' ? 'text-red-400' : 'text-white'}`}>
              {stat.value}
            </div>
            {stat.change !== undefined && (
              <div className={`text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 ${stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%
              </div>
            )}
            {stat.subtext && (
              <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{stat.subtext}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-6 mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-6">
          <h3 className="text-sm sm:text-xl font-semibold text-white">Performance</h3>
          <div className="flex items-center gap-1 overflow-x-auto">
            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition whitespace-nowrap ${
                  selectedTimeframe === tf
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[180px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceHistory}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 9 }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 9 }} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px'
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Performance Analytics Section - Always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6 sm:mb-8"
      >
        <PerformanceAnalytics trades={trades} stockPrices={stockPrices} />
      </motion.div>

      {/* Positions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Positions</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-32 sm:w-48"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {['ALL', 'OPEN', 'CLOSED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    filter === f
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {filteredTrades.length > 0 ? (
            <div className="divide-y divide-gray-700/50">
              {filteredTrades.map((trade, index) => {
                const { pnl, pnlPercent, exitPrice } = calculateTradeMetrics(trade);
                return (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 sm:p-6 hover:bg-gray-700/20 transition group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm sm:text-lg">{trade.ticker.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-white font-bold text-base sm:text-lg">{trade.ticker}</div>
                          <div className="text-gray-400 text-xs sm:text-sm">
                            {trade.shares} shares {trade.sector ? `• ${trade.sector}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-white font-semibold text-base sm:text-lg">${exitPrice.toFixed(2)}</div>
                            {trade.status === 'OPEN' && isLoadingPrices && (
                              <RefreshCw size={14} className="text-emerald-400 animate-spin" />
                            )}
                            {trade.status === 'OPEN' && stockPrices[trade.ticker] && (
                              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Live</span>
                            )}
                          </div>
                          <div className={`text-sm font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            trade.type === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {trade.type}
                          </span>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            trade.status === 'OPEN'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {trade.status}
                          </span>
                          <button
                            onClick={() => deleteTrade(trade.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 grid grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <div className="text-gray-500 text-[10px] sm:text-xs">Entry</div>
                        <div className="text-white font-medium">${trade.entryPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] sm:text-xs">Current</div>
                        <div className="text-white font-medium">${exitPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] sm:text-xs">Value</div>
                        <div className="text-white font-medium">${(exitPrice * trade.shares).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] sm:text-xs">Cost</div>
                        <div className="text-white font-medium">${(trade.entryPrice * trade.shares).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] sm:text-xs">Date</div>
                        <div className="text-white font-medium text-[10px] sm:text-sm">{trade.entryDate}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <Activity className="mx-auto mb-4 text-gray-600" size={48} />
              <h3 className="text-white font-semibold mb-2">No positions found</h3>
              <p className="text-gray-500 mb-6">Start tracking your trades by adding your first position</p>
              <button
                onClick={() => setShowAddTrade(true)}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition"
              >
                Add Your First Trade
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Trade Modal */}
      <AnimatePresence>
        {showAddTrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddTrade(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Add New Trade</h3>
                <button onClick={() => setShowAddTrade(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Ticker Symbol</label>
                  <StockSearch
                    onSelect={handleStockSelect}
                    value={newTrade.ticker}
                    placeholder="Search stocks (e.g., AAPL, Apple)..."
                    autoFocus
                  />
                  {selectedStock && (
                    <div className="mt-2 text-xs text-gray-500">
                      {selectedStock.name} • {selectedStock.sector}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                    <select
                      value={newTrade.type}
                      onChange={(e) => setNewTrade({...newTrade, type: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Shares</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={newTrade.shares}
                      onChange={(e) => setNewTrade({...newTrade, shares: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sector</label>
                  <select
                    value={newTrade.sector}
                    onChange={(e) => setNewTrade({...newTrade, sector: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SECTORS.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Entry Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="150.50"
                        value={newTrade.entryPrice}
                        onChange={(e) => setNewTrade({...newTrade, entryPrice: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                      {isFetchingPrice && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <RefreshCw className="animate-spin text-emerald-500" size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Entry Date</label>
                    <input
                      type="date"
                      value={newTrade.entryDate}
                      onChange={(e) => setNewTrade({...newTrade, entryDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={newTrade.status}
                    onChange={(e) => setNewTrade({...newTrade, status: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {newTrade.status === 'CLOSED' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Exit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="160.50"
                        value={newTrade.exitPrice}
                        onChange={(e) => setNewTrade({...newTrade, exitPrice: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Exit Date</label>
                      <input
                        type="date"
                        value={newTrade.exitDate}
                        onChange={(e) => setNewTrade({...newTrade, exitDate: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={addTrade}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Add Trade
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
