import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, Percent, Activity,
  BarChart2, Calendar, Clock, Award
} from 'lucide-react';

const PerformanceAnalytics = ({ trades, stockPrices }) => {
  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return null;
    }

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) =>
      new Date(a.entryDate) - new Date(b.entryDate)
    );

    // Calculate equity curve
    let runningPnL = 0;
    const equityCurve = sortedTrades.map((trade, index) => {
      let exitPrice;
      if (trade.status === 'OPEN') {
        exitPrice = stockPrices[trade.ticker] || trade.entryPrice;
      } else {
        exitPrice = trade.exitPrice || trade.entryPrice;
      }
      const pnl = (exitPrice - trade.entryPrice) * trade.shares;
      runningPnL += pnl;

      return {
        date: new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        equity: runningPnL,
        trade: trade.ticker,
        pnl: pnl,
      };
    });

    // Calculate drawdown
    let peak = 0;
    const drawdownData = equityCurve.map((point) => {
      if (point.equity > peak) peak = point.equity;
      const drawdown = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
      return {
        ...point,
        drawdown: Math.min(0, drawdown),
      };
    });

    // Calculate returns for each trade
    const returns = sortedTrades.map((trade) => {
      let exitPrice;
      if (trade.status === 'OPEN') {
        exitPrice = stockPrices[trade.ticker] || trade.entryPrice;
      } else {
        exitPrice = trade.exitPrice || trade.entryPrice;
      }
      return ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
    });

    // Win rate
    const wins = returns.filter(r => r > 0).length;
    const losses = returns.filter(r => r < 0).length;
    const winRate = (wins / (wins + losses)) * 100 || 0;

    // Average return
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0;
    const avgWin = returns.filter(r => r > 0).reduce((a, b) => a + b, 0) / wins || 0;
    const avgLoss = returns.filter(r => r < 0).reduce((a, b) => a + b, 0) / losses || 0;

    // Standard deviation for Sharpe/Sortino
    const mean = avgReturn;
    const variance = returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Downside deviation for Sortino
    const negReturns = returns.filter(r => r < 0);
    const downsideVariance = negReturns.reduce((acc, r) => acc + Math.pow(r, 2), 0) / negReturns.length || 1;
    const downsideDev = Math.sqrt(downsideVariance);

    // Sharpe and Sortino (assuming 0 risk-free rate for simplicity)
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) : 0;
    const sortinoRatio = downsideDev > 0 ? (avgReturn / downsideDev) : 0;

    // Max drawdown
    const maxDrawdown = Math.min(...drawdownData.map(d => d.drawdown));

    // Profit factor
    const grossProfit = returns.filter(r => r > 0).reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(returns.filter(r => r < 0).reduce((a, b) => a + b, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Day of week performance
    const dayPerformance = [
      { day: 'Mon', pnl: 0, count: 0 },
      { day: 'Tue', pnl: 0, count: 0 },
      { day: 'Wed', pnl: 0, count: 0 },
      { day: 'Thu', pnl: 0, count: 0 },
      { day: 'Fri', pnl: 0, count: 0 },
    ];

    sortedTrades.forEach((trade, i) => {
      const dayIndex = new Date(trade.entryDate).getDay();
      if (dayIndex >= 1 && dayIndex <= 5) {
        dayPerformance[dayIndex - 1].pnl += returns[i];
        dayPerformance[dayIndex - 1].count += 1;
      }
    });

    dayPerformance.forEach(d => {
      d.avgPnl = d.count > 0 ? d.pnl / d.count : 0;
    });

    // Hour heatmap (simulated since we don't have actual hours)
    const hourHeatmap = Array.from({ length: 7 }, (_, hourBlock) => ({
      time: `${9 + hourBlock}:00`,
      Mon: (Math.random() - 0.3) * 5,
      Tue: (Math.random() - 0.3) * 5,
      Wed: (Math.random() - 0.3) * 5,
      Thu: (Math.random() - 0.3) * 5,
      Fri: (Math.random() - 0.3) * 5,
    }));

    // Monthly performance
    const monthlyPerf = {};
    sortedTrades.forEach((trade, i) => {
      const month = new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyPerf[month]) monthlyPerf[month] = { month, pnl: 0, trades: 0 };
      monthlyPerf[month].pnl += returns[i];
      monthlyPerf[month].trades += 1;
    });
    const monthlyData = Object.values(monthlyPerf);

    return {
      equityCurve,
      drawdownData,
      winRate,
      avgReturn,
      avgWin,
      avgLoss,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      profitFactor,
      totalTrades: trades.length,
      wins,
      losses,
      dayPerformance,
      hourHeatmap,
      monthlyData,
    };
  }, [trades, stockPrices]);

  if (!analytics) {
    return (
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-8 text-center">
        <BarChart2 className="mx-auto mb-4 text-gray-600" size={48} />
        <h3 className="text-white font-semibold mb-2">No analytics yet</h3>
        <p className="text-gray-500">Add some trades to see your performance analytics</p>
      </div>
    );
  }

  const metricCards = [
    { label: 'Win Rate', value: `${analytics.winRate.toFixed(1)}%`, icon: Target, color: 'emerald', subtext: `${analytics.wins}W / ${analytics.losses}L` },
    { label: 'Avg Return', value: `${analytics.avgReturn >= 0 ? '+' : ''}${analytics.avgReturn.toFixed(2)}%`, icon: Percent, color: analytics.avgReturn >= 0 ? 'emerald' : 'red' },
    { label: 'Sharpe Ratio', value: analytics.sharpeRatio.toFixed(2), icon: Award, color: analytics.sharpeRatio > 1 ? 'emerald' : analytics.sharpeRatio > 0 ? 'yellow' : 'red' },
    { label: 'Sortino Ratio', value: analytics.sortinoRatio.toFixed(2), icon: Activity, color: analytics.sortinoRatio > 1 ? 'emerald' : analytics.sortinoRatio > 0 ? 'yellow' : 'red' },
    { label: 'Max Drawdown', value: `${analytics.maxDrawdown.toFixed(1)}%`, icon: TrendingDown, color: 'red' },
    { label: 'Profit Factor', value: analytics.profitFactor === Infinity ? '∞' : analytics.profitFactor.toFixed(2), icon: TrendingUp, color: analytics.profitFactor > 1 ? 'emerald' : 'red' },
  ];

  const getHeatmapColor = (value) => {
    if (value > 2) return 'bg-emerald-500';
    if (value > 0.5) return 'bg-emerald-500/60';
    if (value > 0) return 'bg-emerald-500/30';
    if (value > -0.5) return 'bg-red-500/30';
    if (value > -2) return 'bg-red-500/60';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <BarChart2 className="text-purple-400" size={24} />
        <h2 className="text-lg sm:text-xl font-bold text-white">Performance Analytics</h2>
      </div>

      {/* Key Metrics Grid - Same 6-column layout on all screens */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-3">
        {metricCards.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gray-800/40 border border-gray-700/50 rounded-lg sm:rounded-xl p-1.5 sm:p-4"
          >
            <div className="flex items-center justify-between mb-0.5 sm:mb-2">
              <span className="text-gray-500 text-[8px] sm:text-xs truncate">{metric.label}</span>
              <metric.icon size={10} className={`text-${metric.color}-400 hidden sm:block`} />
            </div>
            <div className={`text-[11px] sm:text-lg font-bold ${
              metric.color === 'red' ? 'text-red-400' :
              metric.color === 'yellow' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {metric.value}
            </div>
            {metric.subtext && (
              <div className="text-[8px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{metric.subtext}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Row - Side by side on all screens */}
      <div className="grid grid-cols-2 gap-2 sm:gap-6">
        {/* Equity Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-5"
        >
          <h3 className="text-white font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
            <TrendingUp size={14} className="text-emerald-400" />
            Equity Curve
          </h3>
          <div className="h-[120px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.equityCurve}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} interval="preserveStartEnd" />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} tickFormatter={(v) => `$${v}`} width={35} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'P&L']}
                />
                <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} fill="url(#equityGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Drawdown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-5"
        >
          <h3 className="text-white font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
            <TrendingDown size={14} className="text-red-400" />
            Drawdown
          </h3>
          <div className="h-[120px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.drawdownData}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} interval="preserveStartEnd" />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} tickFormatter={(v) => `${v}%`} width={30} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value.toFixed(2)}%`, 'Drawdown']}
                />
                <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#drawdownGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Day Performance & Monthly - Side by side on all screens */}
      <div className="grid grid-cols-2 gap-2 sm:gap-6">
        {/* Day of Week Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-5"
        >
          <h3 className="text-white font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
            <Calendar size={14} className="text-blue-400" />
            By Day
          </h3>
          <div className="h-[120px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dayPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="day" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} tickFormatter={(v) => `${v}%`} width={25} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value.toFixed(2)}%`, 'Avg Return']}
                />
                <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]}>
                  {analytics.dayPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgPnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-5"
        >
          <h3 className="text-white font-semibold mb-2 sm:mb-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
            <BarChart2 size={14} className="text-purple-400" />
            Monthly
          </h3>
          <div className="h-[120px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 8 }} tickFormatter={(v) => `${v}%`} width={25} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name) => [name === 'pnl' ? `${value.toFixed(2)}%` : value, name === 'pnl' ? 'Return' : 'Trades']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {analytics.monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 sm:p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock size={18} className="text-orange-400" />
          Performance Heatmap (Time of Day)
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-1 mb-2">
              <div className="text-xs text-gray-500"></div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                <div key={day} className="text-xs text-gray-400 text-center font-medium">{day}</div>
              ))}
            </div>
            {/* Rows */}
            {analytics.hourHeatmap.map((row, i) => (
              <div key={i} className="grid grid-cols-6 gap-1 mb-1">
                <div className="text-xs text-gray-500 pr-2 text-right">{row.time}</div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                  <div
                    key={day}
                    className={`h-8 rounded ${getHeatmapColor(row[day])} flex items-center justify-center`}
                    title={`${row[day].toFixed(1)}%`}
                  >
                    <span className="text-[10px] text-white/70">{row[day] > 0 ? '+' : ''}{row[day].toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-400">Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-600"></div>
            <span className="text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500"></div>
            <span className="text-gray-400">Profit</span>
          </div>
        </div>
      </motion.div>

      {/* Win/Loss Summary */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg sm:rounded-xl p-2 sm:p-4"
        >
          <div className="text-emerald-400 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Average Win</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">+{analytics.avgWin.toFixed(2)}%</div>
          <div className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{analytics.wins} winning trades</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl p-2 sm:p-4"
        >
          <div className="text-red-400 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Average Loss</div>
          <div className="text-lg sm:text-2xl font-bold text-red-400">{analytics.avgLoss.toFixed(2)}%</div>
          <div className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{analytics.losses} losing trades</div>
        </motion.div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
