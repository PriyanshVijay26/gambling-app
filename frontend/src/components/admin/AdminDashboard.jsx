import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Shield,
  Settings,
  RefreshCw,
  Calendar,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      totalGames: 0,
      houseEdge: 0
    },
    revenueChart: [],
    userActivity: [],
    gameStats: [],
    recentTransactions: [],
    systemHealth: {
      cpu: 0,
      memory: 0,
      database: 'healthy',
      uptime: 0
    }
  });
  
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  const { socket } = useSocket();
  const { success, error } = useNotification();

  useEffect(() => {
    if (socket) {
      fetchAnalytics();
      
      // Listen for real-time updates
      socket.on('admin:analytics', (data) => {
        setAnalytics(data);
        setIsLoading(false);
      });
      
      socket.on('admin:systemHealth', (health) => {
        setAnalytics(prev => ({ ...prev, systemHealth: health }));
      });
      
      // Set up periodic updates
      const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
      
      return () => {
        socket.off('admin:analytics');
        socket.off('admin:systemHealth');
        clearInterval(interval);
      };
    }
  }, [socket, timeRange]);

  const fetchAnalytics = () => {
    if (socket) {
      socket.emit('admin:getAnalytics', { timeRange });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Real-time analytics and system monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* System Health Alert */}
        {analytics.systemHealth.database !== 'healthy' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-bold">System Health Warning</h3>
                <p className="text-red-300">Database status: {analytics.systemHealth.database}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{formatNumber(analytics.overview.totalUsers)}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
            <div className="text-xs text-green-400 mt-1">
              {formatNumber(analytics.overview.activeUsers)} active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{formatCurrency(analytics.overview.totalRevenue)}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
            <div className="text-xs text-green-400 mt-1">
              {analytics.overview.houseEdge}% house edge
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{formatNumber(analytics.overview.totalGames)}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Games Played</h3>
            <div className="text-xs text-blue-400 mt-1">
              Last {timeRange}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-yellow-400" />
              <span className={`text-2xl font-bold ${getHealthColor(analytics.systemHealth.database)}`}>
                {analytics.systemHealth.database}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">System Health</h3>
            <div className="text-xs text-gray-400 mt-1">
              Uptime: {Math.floor(analytics.systemHealth.uptime / 3600)}h
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;