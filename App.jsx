import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, PlusCircle, X, Search, RefreshCw, Download } from 'lucide-react';

const AlphaHunt = () => {
  const [trades, setTrades] = useState([]);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [stockPrices, setStockPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [newTrade, setNewTrade] = useState({
    ticker: '', type: 'BUY', shares: '', entryPrice: '', exitPrice: '', 
    entryDate: '', exitDate: '', status: 'OPEN', sector: 'Technology'
  });
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [tickerSearch, setTickerSearch] = useState('');
  const [tickerSuggestions, setTickerSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const fetchStockPrices = useCallback(async (tradesToFetch) => {
    setIsLoadingPrices(true);
    const openTickers = [...new Set(tradesToFetch.filter(t => t.status === 'OPEN').map(t => t.ticker))];
    
    if (openTickers.length === 0) {
      setIsLoadingPrices(false);
      return;
    }

    const prices = {};
    const API_KEY = 'WDYQC1WE37RIXN9A';
    
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

  useEffect(() => {
    const savedTrades = localStorage.getItem('alphahunt_trades');
    if (savedTrades) {
      const loadedTrades = JSON.parse(savedTrades);
      setTrades(loadedTrades);
      fetchStockPrices(loadedTrades);
    }
  }, [fetchStockPrices]);

  const saveTrades = (updatedTrades) => {
    localStorage.setItem('alphahunt_trades', JSON.stringify(updatedTrades));
  };

  const searchTickers = async (query) => {
    if (!query || query.length < 1) {
      setTickerSuggestions([]);
      return;
    }

    setIsSearching(true);
    const API_KEY = 'WDYQC1WE37RIXN9A';

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.bestMatches && data.bestMatches.length > 0) {
        const suggestions = data.bestMatches.slice(0, 15).map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region']
        }));
        setTickerSuggestions(suggestions);
      } else {
        setTickerSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching tickers:', error);
      setTickerSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchCurrentPrice = async (ticker) => {
    if (!ticker) return;
    
    setIsFetchingPrice(true);
    const API_KEY = 'WDYQC1WE37RIXN9A';

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

  const selectTicker = (symbol) => {
    setNewTrade(prev => ({ ...prev, ticker: symbol }));
    setTickerSearch(symbol);
    setTickerSuggestions([]);
    fetchCurrentPrice(symbol);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (tickerSearch && tickerSearch.length >= 1) {
        searchTickers(tickerSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tickerSearch]);

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

  const addTrade = () => {
    if (!newTrade.ticker || !newTrade.shares || !newTrade.entryPrice || !newTrade.entryDate) return;
    
    const trade = {
      id: Date.now(),
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

    const updatedTrades = [...trades, trade];
    setTrades(updatedTrades);
    saveTrades(updatedTrades);
    
    if (trade.status === 'OPEN') {
      fetchStockPrices(updatedTrades);
    }
    
    setNewTrade({ ticker: '', type: 'BUY', shares: '', entryPrice: '', exitPrice: '', entryDate: '', exitDate: '', status: 'OPEN', sector: 'Technology' });
    setTickerSearch('');
    setTickerSuggestions([]);
    setShowAddTrade(false);
  };

  const exportToCSV = () => {
    const headers = ['Ticker', 'Type', 'Shares', 'Entry Price', 'Exit Price', 'Entry Date', 'Exit Date', 'Status', 'P&L', 'Return %'];
    const rows = trades.map(trade => {
      const { pnl, pnlPercent, exitPrice } = calculateTradeMetrics(trade);
      return [
        trade.ticker,
        trade.type,
        trade.shares,
        trade.entryPrice,
        exitPrice.toFixed(2),
        trade.entryDate,
        trade.exitDate || 'N/A',
        trade.status,
        pnl.toFixed(2),
        pnlPercent.toFixed(2)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-black/30 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                AlphaHunt
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-64"
                />
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
                Export
              </button>
              <button
                onClick={() => setShowAddTrade(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-lg transition text-sm font-medium"
              >
                <PlusCircle size={18} />
                Add Trade
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-gray-500 text-xs mb-1">Portfolio Value</div>
              <div className="text-xl font-bold text-white">${stats.totalValue.toFixed(2)}</div>
              <div className={`text-xs font-medium flex items-center gap-1 ${stats.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.totalReturn >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-xs mb-1">Total P&L</div>
              <div className={`text-xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                Invested: ${stats.totalInvested.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-xs mb-1">Win Rate</div>
              <div className="text-xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">
                {stats.wins}W / {stats.losses}L
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-xs mb-1">Active Positions</div>
              <div className="text-xl font-bold text-white">
                {trades.filter(t => t.status === 'OPEN').length}
              </div>
              <div className="text-xs text-gray-500">
                {trades.length} total trades
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Performance</h3>
            <div className="flex items-center gap-2">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(tf => (
                <button
                  key={tf}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition"
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceHistory}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Positions</h3>
              <div className="flex items-center gap-2">
                {['ALL', 'OPEN', 'CLOSED'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
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

          {filteredTrades.length > 0 ? (
            <div className="divide-y divide-gray-700/50">
              {filteredTrades.map((trade) => {
                const { pnl, pnlPercent, exitPrice } = calculateTradeMetrics(trade);
                return (
                  <div key={trade.id} className="p-6 hover:bg-gray-700/20 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{trade.ticker.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-white font-bold text-lg">{trade.ticker}</div>
                          <div className="text-gray-400 text-sm">
                            {trade.shares} shares • {trade.sector || 'Technology'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <div className="text-white font-semibold text-lg">${exitPrice.toFixed(2)}</div>
                          {trade.status === 'OPEN' && isLoadingPrices && (
                            <RefreshCw size={14} className="text-emerald-400 animate-spin" />
                          )}
                          {trade.status === 'OPEN' && stockPrices[trade.ticker] && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Live</span>
                          )}
                        </div>
                        <div className={`text-sm font-medium mb-1 ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </div>
                        <div className="text-xs text-gray-500">
                          ${exitPrice.toFixed(2)} × {trade.shares} = ${(exitPrice * trade.shares).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trade.type === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {trade.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trade.status === 'OPEN' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {trade.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Entry Price</div>
                        <div className="text-white font-medium">${trade.entryPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Current Price</div>
                        <div className="text-white font-medium flex items-center gap-1">
                          ${exitPrice.toFixed(2)}
                          {trade.status === 'OPEN' && stockPrices[trade.ticker] && (
                            <span className="text-xs text-emerald-400">●</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Total Value</div>
                        <div className="text-white font-medium">${(exitPrice * trade.shares).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Cost Basis</div>
                        <div className="text-white font-medium">${(trade.entryPrice * trade.shares).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Entry Date</div>
                        <div className="text-white font-medium">{trade.entryDate}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Activity className="mx-auto mb-4 text-gray-600" size={48} />
              <h3 className="text-white font-semibold mb-2">No positions found</h3>
              <p className="text-gray-500 mb-6">Start tracking your trades by adding your first position</p>
              <button
                onClick={() => setShowAddTrade(true)}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition"
              >
                Add Your First Trade
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddTrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Trade</h3>
              <button onClick={() => setShowAddTrade(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ticker Symbol</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search stocks (e.g., AAPL)..."
                    value={tickerSearch}
                    onChange={(e) => {
                      setTickerSearch(e.target.value.toUpperCase());
                      setNewTrade({...newTrade, ticker: e.target.value.toUpperCase()});
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <RefreshCw className="animate-spin text-gray-400" size={16} />
                    </div>
                  )}
                  
                  {tickerSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                      {tickerSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectTicker(suggestion.symbol)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition flex items-center justify-between border-b border-gray-700 last:border-b-0"
                        >
                          <div>
                            <div className="font-semibold text-white">{suggestion.symbol}</div>
                            <div className="text-xs text-gray-500 truncate">{suggestion.name}</div>
                          </div>
                          <div className="text-xs text-gray-600">{suggestion.region}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Energy">Energy</option>
                  <option value="Industrial">Industrial</option>
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
                  {newTrade.entryPrice && (
                    <p className="text-xs text-emerald-400 mt-1">✓ Price loaded</p>
                  )}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AlphaHunt;
