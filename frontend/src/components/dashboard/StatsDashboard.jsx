import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Calendar,
  Trophy,
  BarChart3,
  PieChart,
  Activity,
  Clock
} from 'lucide-react';

// Animated Number Counter
const AnimatedCounter = ({ value, duration = 1000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const startValue = count;
    const endValue = value;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentCount = Math.floor(startValue + (endValue - startValue) * progress);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration, count]);

  return (
    <span>{prefix}{count.toLocaleString()}{suffix}</span>
  );
};

// Statistics Card Component
const StatCard = ({ icon: Icon, title, value, change, trend, color = 'blue', delay = 0 }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    red: 'from-red-600 to-red-700',
    yellow: 'from-yellow-600 to-yellow-700',
    purple: 'from-purple-600 to-purple-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">
          <AnimatedCounter value={value} />
        </h3>
        <p className="text-slate-400 text-sm">{title}</p>
      </div>
    </motion.div>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Game Activity</h3>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={item.name} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md mb-2 min-h-[4px] w-full"
            />
            <span className="text-xs text-slate-400 text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = '#3b82f6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">
          <AnimatedCounter value={percentage} suffix="%" />
        </span>
      </div>
    </div>
  );
};

// Main Dashboard Component
export const StatsDashboard = ({ playerStats }) => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in production, this would come from your API
  const stats = {
    totalWins: 145,
    totalLosses: 89,
    totalProfit: 2847,
    winRate: 62,
    biggestWin: 1250,
    gamesPlayed: 234,
    favoriteGame: 'Mines',
    avgBetSize: 15.5
  };

  const gameActivity = [
    { name: 'Mines', value: 45 },
    { name: 'Crash', value: 32 },
    { name: 'Dice', value: 28 },
    { name: 'Plinko', value: 19 },
    { name: 'Towers', value: 15 }
  ];

  const recentGames = [
    { game: 'Mines', result: 'win', amount: 125, multiplier: '2.5x', time: '2 min ago' },
    { game: 'Crash', result: 'loss', amount: -50, multiplier: '1.2x', time: '5 min ago' },
    { game: 'Dice', result: 'win', amount: 80, multiplier: '1.8x', time: '8 min ago' },
    { game: 'Plinko', result: 'win', amount: 200, multiplier: '4.0x', time: '12 min ago' },
    { game: 'Towers', result: 'loss', amount: -75, multiplier: '0x', time: '15 min ago' }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold text-white">Player Statistics</h1>
        <div className="flex gap-2">
          {['24h', '7d', '30d', 'all'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Trophy}
          title="Total Wins"
          value={stats.totalWins}
          change="+12%"
          trend="up"
          color="green"
          delay={0}
        />
        <StatCard
          icon={DollarSign}
          title="Total Profit"
          value={stats.totalProfit}
          change="+8%"
          trend="up"
          color="blue"
          delay={0.1}
        />
        <StatCard
          icon={Target}
          title="Win Rate"
          value={stats.winRate}
          change="+3%"
          trend="up"
          color="purple"
          delay={0.2}
        />
        <StatCard
          icon={BarChart3}
          title="Games Played"
          value={stats.gamesPlayed}
          change="+5%"
          trend="up"
          color="yellow"
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <SimpleBarChart data={gameActivity} />
        </div>

        {/* Win Rate Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Win Rate</h3>
          <ProgressRing percentage={stats.winRate} color="#10b981" />
          <p className="text-slate-400 text-sm mt-4 text-center">
            {stats.totalWins} wins out of {stats.gamesPlayed} games
          </p>
        </motion.div>
      </div>

      {/* Recent Games */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Games
          </h3>
        </div>
        <div className="divide-y divide-slate-700">
          {recentGames.map((game, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-4 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    game.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-white font-medium">{game.game}</span>
                  <span className="text-slate-400">{game.multiplier}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${
                    game.result === 'win' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {game.amount > 0 ? '+' : ''}{game.amount}
                  </span>
                  <span className="text-slate-500 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {game.time}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievement Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 rounded-xl text-white">
          <Trophy className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Biggest Win</h3>
          <p className="text-2xl font-bold">
            <AnimatedCounter value={stats.biggestWin} prefix="$" />
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white">
          <Target className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Favorite Game</h3>
          <p className="text-2xl font-bold">{stats.favoriteGame}</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
          <DollarSign className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Avg Bet Size</h3>
          <p className="text-2xl font-bold">
            <AnimatedCounter value={stats.avgBetSize} prefix="$" />
          </p>
        </div>
      </motion.div>
    </div>
  );
};