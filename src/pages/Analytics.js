import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  BarChart3, Users, Eye, Clock, Globe, Monitor,
  Smartphone, TrendingUp, Calendar, Activity, RefreshCw, Trash2
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState(null);

  const loadAnalytics = () => {
    const dailyStats = JSON.parse(localStorage.getItem('alphahunt_daily_stats') || '{}');
    const sessions = JSON.parse(localStorage.getItem('alphahunt_sessions') || '[]');
    const pageViews = JSON.parse(localStorage.getItem('alphahunt_pageviews') || '[]');

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Filter page views by date range
    const filteredViews = pageViews.filter(v => new Date(v.timestamp) >= startDate);
    const filteredSessions = sessions.filter(s => new Date(s.start) >= startDate);

    // Total stats
    const totalViews = filteredViews.length;
    const totalSessions = filteredSessions.length;
    const uniqueVisitors = new Set(filteredSessions.map(s => s.id)).size;

    // Avg session duration (estimate from page views per session)
    const viewsPerSession = totalSessions > 0 ? (totalViews / totalSessions).toFixed(1) : 0;

    // Daily chart data
    const dailyChartData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayData = dailyStats[dateKey] || { views: 0, sessions: 0 };
      dailyChartData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateKey,
        views: dayData.views,
        visitors: dayData.sessions,
      });
    }

    // Page breakdown
    const pageCounts = {};
    filteredViews.forEach(v => {
      const name = v.title || v.path;
      pageCounts[name] = (pageCounts[name] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([name, count]) => ({ name, count, percent: totalViews > 0 ? ((count / totalViews) * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.count - a.count);

    // Hourly distribution
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, views: 0 }));
    filteredViews.forEach(v => {
      const h = new Date(v.timestamp).getHours();
      hourlyData[h].views += 1;
    });

    // Device breakdown (from user agent)
    let mobileCount = 0;
    let desktopCount = 0;
    filteredSessions.forEach(s => {
      if (/mobile|android|iphone|ipad/i.test(s.userAgent || '')) {
        mobileCount++;
      } else {
        desktopCount++;
      }
    });
    const deviceData = [
      { name: 'Desktop', value: desktopCount },
      { name: 'Mobile', value: mobileCount },
    ].filter(d => d.value > 0);

    // Referrer breakdown
    const referrerCounts = {};
    filteredSessions.forEach(s => {
      const ref = s.referrer || 'direct';
      const domain = ref === 'direct' ? 'Direct' : (() => {
        try { return new URL(ref).hostname; } catch { return ref; }
      })();
      referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalViews,
      totalSessions,
      uniqueVisitors,
      viewsPerSession,
      dailyChartData,
      topPages,
      hourlyData,
      deviceData,
      topReferrers,
    });
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const clearAnalytics = () => {
    if (window.confirm('Clear all analytics data? This cannot be undone.')) {
      localStorage.removeItem('alphahunt_pageviews');
      localStorage.removeItem('alphahunt_sessions');
      localStorage.removeItem('alphahunt_daily_stats');
      loadAnalytics();
    }
  };

  if (!stats) return null;

  const summaryCards = [
    { label: 'Total Page Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Total Sessions', value: stats.totalSessions.toLocaleString(), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Unique Visitors', value: stats.uniqueVisitors.toLocaleString(), icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Pages / Session', value: stats.viewsPerSession, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={28} />
            Analytics
          </h1>
          <p className="text-gray-500 mt-1">Track your site's traffic and engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearAnalytics}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition text-sm"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { id: '24h', label: 'Last 24h' },
          { id: '7d', label: '7 Days' },
          { id: '30d', label: '30 Days' },
          { id: '90d', label: '90 Days' },
        ].map((range) => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              timeRange === range.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Traffic Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 sm:p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-400" />
          Traffic Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats.dailyChartData}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
            <Area type="monotone" dataKey="views" name="Page Views" stroke="#3b82f6" strokeWidth={2} fill="url(#viewsGradient)" />
            <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#10b981" strokeWidth={2} fill="url(#visitorsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hourly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-yellow-400" />
            Activity by Hour
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="hour"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                interval={3}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="views" name="Views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Monitor size={20} className="text-blue-400" />
            Devices
          </h3>
          {stats.deviceData.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.deviceData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {stats.deviceData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {item.name === 'Desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
                        {item.name}
                      </div>
                      <div className="text-gray-500 text-sm">{item.value} sessions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No device data yet</div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye size={20} className="text-emerald-400" />
            Top Pages
          </h3>
          {stats.topPages.length > 0 ? (
            <div className="space-y-3">
              {stats.topPages.map((page, i) => (
                <div key={page.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/20 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium w-6">#{i + 1}</span>
                    <span className="text-white">{page.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{page.count} views</span>
                    <div className="w-20 bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${page.percent}%` }}
                      />
                    </div>
                    <span className="text-gray-500 text-sm w-12 text-right">{page.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No page data yet</div>
          )}
        </motion.div>

        {/* Top Referrers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-purple-400" />
            Traffic Sources
          </h3>
          {stats.topReferrers.length > 0 ? (
            <div className="space-y-3">
              {stats.topReferrers.map((ref, i) => (
                <div key={ref.source} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/20 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium w-6">#{i + 1}</span>
                    <span className="text-white">{ref.source}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{ref.count} visits</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No referrer data yet</div>
          )}
        </motion.div>
      </div>

      {/* External Analytics Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 sm:p-6"
      >
        <h4 className="text-blue-400 font-semibold mb-2">External Analytics</h4>
        <p className="text-gray-400 text-sm">
          This dashboard shows in-app analytics stored locally. For comprehensive, multi-user analytics:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <strong className="text-white">Vercel Analytics</strong> — Enabled automatically on your Vercel deployment
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <strong className="text-white">Google Analytics</strong> — Add your GA4 Measurement ID to environment variables
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Analytics;
