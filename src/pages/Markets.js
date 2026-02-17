import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, RefreshCw,
  ArrowUpRight, ArrowDownRight, Flame, BarChart3
} from 'lucide-react';

const FINNHUB_KEY = process.env.REACT_APP_FINNHUB_API_KEY || '';

// Major indices data (simulated for demo, would use real API)
const INDICES = [
  { symbol: 'SPY', name: 'S&P 500', fullName: 'SPDR S&P 500 ETF' },
  { symbol: 'DIA', name: 'Dow Jones', fullName: 'SPDR Dow Jones Industrial Average ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100', fullName: 'Invesco QQQ Trust' },
  { symbol: 'IWM', name: 'Russell 2000', fullName: 'iShares Russell 2000 ETF' },
];

// Popular stocks to track
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
];

const Markets = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [indicesData, setIndicesData] = useState({});
  const [stocksData, setStocksData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);

  // Generate mock sparkline data
  const generateSparkline = (trend = 'up') => {
    const data = [];
    let value = 100;
    for (let i = 0; i < 20; i++) {
      const change = (Math.random() - (trend === 'up' ? 0.4 : 0.6)) * 5;
      value = Math.max(80, Math.min(120, value + change));
      data.push({ value });
    }
    return data;
  };

  // Fetch market data using Finnhub API
  const fetchMarketData = async () => {
    setIsLoading(true);

    // Fetch indices
    const indexPrices = {};
    for (const index of INDICES) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${index.symbol}&token=${FINNHUB_KEY}`
        );
        const data = await response.json();
        if (data && data.c && data.c > 0) {
          indexPrices[index.symbol] = {
            price: data.c,              // current price
            change: data.d || 0,         // change
            changePercent: data.dp || 0, // change percent
            sparkline: generateSparkline(data.d >= 0 ? 'up' : 'down'),
          };
        }
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`Error fetching ${index.symbol}:`, error);
      }
    }
    setIndicesData(indexPrices);

    // Fetch popular stocks
    const stockPrices = {};
    for (const stock of POPULAR_STOCKS) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`
        );
        const data = await response.json();
        if (data && data.c && data.c > 0) {
          stockPrices[stock.symbol] = {
            price: data.c,              // current price
            change: data.d || 0,         // change
            changePercent: data.dp || 0, // change percent
            high: data.h || 0,           // high
            low: data.l || 0,            // low
            volume: 0,                   // Finnhub quote doesn't include volume
          };
        }
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`Error fetching ${stock.symbol}:`, error);
      }
    }
    setStocksData(stockPrices);

    // Sort into gainers and losers
    const sortedStocks = POPULAR_STOCKS.map(s => ({
      ...s,
      ...(stockPrices[s.symbol] || {}),
    })).filter(s => s.price);

    setGainers(sortedStocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent));
    setLosers(sortedStocks.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent));

    setIsLoading(false);
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'gainers', label: 'Gainers', icon: TrendingUp },
    { id: 'losers', label: 'Losers', icon: TrendingDown },
    { id: 'trending', label: 'Trending', icon: Flame },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-emerald-400" size={28} />
            Markets
          </h1>
          <p className="text-gray-500 mt-1">Real-time market data and trends</p>
        </div>
        <button
          onClick={fetchMarketData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Indices Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Major Indices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INDICES.map((index, i) => {
            const data = indicesData[index.symbol] || {};
            const isPositive = data.changePercent >= 0;

            return (
              <motion.div
                key={index.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{index.name}</h3>
                    <p className="text-gray-500 text-xs">{index.symbol}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                    isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {isPositive ? '+' : ''}{data.changePercent?.toFixed(2) || 0}%
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-white">
                    ${data.price?.toFixed(2) || '—'}
                  </div>
                  {data.sparkline && (
                    <div className="w-20 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.sparkline}>
                          <defs>
                            <linearGradient id={`gradient-${index.symbol}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? '#10b981' : '#ef4444'}
                            fill={`url(#gradient-${index.symbol})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden">
        {activeTab === 'overview' && (
          <div className="divide-y divide-gray-700/50">
            <div className="grid grid-cols-5 gap-4 p-4 text-sm font-medium text-gray-500 border-b border-gray-700/50">
              <div>Symbol</div>
              <div className="text-right">Price</div>
              <div className="text-right">Change</div>
              <div className="text-right hidden sm:block">Volume</div>
              <div className="text-right hidden sm:block">High/Low</div>
            </div>
            {POPULAR_STOCKS.map((stock, i) => {
              const data = stocksData[stock.symbol] || {};
              const isPositive = data.changePercent >= 0;

              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-700/20 transition items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-gray-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{stock.symbol}</div>
                      <div className="text-gray-500 text-xs hidden sm:block truncate max-w-[100px]">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">${data.price?.toFixed(2) || '—'}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isPositive ? '+' : ''}{data.changePercent?.toFixed(2) || 0}%
                    </span>
                  </div>
                  <div className="text-right text-gray-400 hidden sm:block">
                    {data.volume ? `${(data.volume / 1000000).toFixed(1)}M` : '—'}
                  </div>
                  <div className="text-right text-gray-500 text-sm hidden sm:block">
                    {data.high ? `$${data.high.toFixed(2)} / $${data.low?.toFixed(2)}` : '—'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'gainers' && (
          <div className="divide-y divide-gray-700/50">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="text-emerald-400" size={18} />
                Top Gainers
              </h3>
            </div>
            {gainers.length > 0 ? gainers.map((stock, i) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 hover:bg-gray-700/20 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-gray-500 w-6">#{i + 1}</div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{stock.symbol}</div>
                    <div className="text-gray-500 text-sm">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">${stock.price?.toFixed(2)}</div>
                  <div className="text-emerald-400 font-medium">+{stock.changePercent?.toFixed(2)}%</div>
                </div>
              </motion.div>
            )) : (
              <div className="p-8 text-center text-gray-500">No gainers data available</div>
            )}
          </div>
        )}

        {activeTab === 'losers' && (
          <div className="divide-y divide-gray-700/50">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <TrendingDown className="text-red-400" size={18} />
                Top Losers
              </h3>
            </div>
            {losers.length > 0 ? losers.map((stock, i) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 hover:bg-gray-700/20 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-gray-500 w-6">#{i + 1}</div>
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{stock.symbol}</div>
                    <div className="text-gray-500 text-sm">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">${stock.price?.toFixed(2)}</div>
                  <div className="text-red-400 font-medium">{stock.changePercent?.toFixed(2)}%</div>
                </div>
              </motion.div>
            )) : (
              <div className="p-8 text-center text-gray-500">No losers data available</div>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="divide-y divide-gray-700/50">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Flame className="text-orange-400" size={18} />
                Trending Now
              </h3>
            </div>
            {POPULAR_STOCKS.slice(0, 5).map((stock, i) => {
              const data = stocksData[stock.symbol] || {};
              const isPositive = data.changePercent >= 0;

              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 hover:bg-gray-700/20 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-orange-400 w-6">
                      <Flame size={20} />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-orange-400 font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{stock.symbol}</div>
                      <div className="text-gray-500 text-sm">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">${data.price?.toFixed(2) || '—'}</div>
                    <div className={`font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{data.changePercent?.toFixed(2) || 0}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;
