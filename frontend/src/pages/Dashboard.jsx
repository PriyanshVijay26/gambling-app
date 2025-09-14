import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock,
  Trophy,
  Bomb,
  Coins,
  Zap,
  Target,
  Gamepad2,
  Activity,
  Calendar,
  Dice6,
  Triangle,
  Building2
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import FairnessAndLeaderboard from '../components/FairnessAndLeaderboard';
import ClientSeedWidget from '../components/ClientSeedWidget';
import FairnessRevealPanel from '../components/FairnessRevealPanel';
import ChatPanel from '../components/ChatPanel';
import LiveFeed from '../components/LiveFeed';
import ReferralSystem from '../components/ReferralSystem';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGames: 0,
    winRate: 0,
    totalWinnings: 0,
    currentStreak: 0
  });
  const [recentGames, setRecentGames] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const { socket, connected } = useSocket();

  const games = [
    {
      name: 'Mines',
      icon: Bomb,
      color: 'from-red-500 to-red-700',
      href: '/games/mines',
      players: 24,
      status: 'active'
    },
    {
      name: 'Coin Flip',
      icon: Coins,
      color: 'from-yellow-500 to-yellow-700',
      href: '/games/coinflip',
      players: 18,
      status: 'active'
    },
    {
      name: 'Limbo',
      icon: TrendingUp,
      color: 'from-green-500 to-green-700',
      href: '/games/limbo',
      players: 12,
      status: 'active'
    },
    {
      name: 'Crash',
      icon: Zap,
      color: 'from-orange-500 to-orange-700',
      href: '/games/crash',
      players: 31,
      status: 'active'
    },
    {
      name: 'Upgrader',
      icon: Target,
      color: 'from-purple-500 to-purple-700',
      href: '/games/upgrader',
      players: 8,
      status: 'active'
    },
    {
      name: 'Murder Mystery',
      icon: Gamepad2,
      color: 'from-pink-500 to-pink-700',
      href: '/games/murder-mystery',
      players: 16,
      status: 'waiting'
    },
    {
      name: 'Dice',
      icon: Dice6,
      color: 'from-blue-500 to-blue-700',
      href: '/games/dice',
      players: 9,
      status: 'active'
    },
    {
      name: 'Plinko',
      icon: Triangle,
      color: 'from-indigo-500 to-indigo-700',
      href: '/games/plinko',
      players: 14,
      status: 'active'
    },
    {
      name: 'Towers',
      icon: Building2,
      color: 'from-emerald-500 to-emerald-700',
      href: '/games/towers',
      players: 7,
      status: 'active'
    }
  ];

  useEffect(() => {
    if (socket && connected) {
      // Request dashboard data
      socket.emit('getDashboardData');
      
      socket.on('dashboardData', (data) => {
        setStats(data.stats);
        setRecentGames(data.recentGames);
        setActiveGames(data.activeGames);
      });

      return () => {
        socket.off('dashboardData');
      };
    }
  }, [socket, connected]);

  const statCards = [
    {
      title: 'Total Games',
      value: stats.totalGames,
      icon: Activity,
      color: 'text-blue-400'
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: Trophy,
      color: 'text-green-400'
    },
    {
      title: 'Total Winnings',
      value: `$${stats.totalWinnings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-yellow-400'
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      icon: Zap,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gaming Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Track your performance and join live games
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
              </div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Games Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Available Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((game, index) => {
                const Icon = game.icon;
                return (
                  <motion.div
                    key={game.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group"
                  >
                    <Link to={game.href} className="block">
                      <div className="game-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{game.players}</span>
                            </div>
                            <div className={`text-xs font-medium ${
                              game.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {game.status === 'active' ? 'Live' : 'Waiting'}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
                        <div className="text-primary-400 font-semibold group-hover:text-primary-300 transition-colors duration-200">
                          Join Game →
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Fairness + Leaderboard */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Fairness & Leaderboard</h3>
              <div className="space-y-4">
                <FairnessAndLeaderboard />
                <ClientSeedWidget />
                <FairnessRevealPanel onReveal={(seed) => console.log('Revealed seed:', seed)} />
              </div>
            </div>
            {/* Recent Games */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-400" />
                Recent Games
              </h3>
              <div className="space-y-3">
                {recentGames.length > 0 ? (
                  recentGames.map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{game.type}</div>
                        <div className="text-gray-400 text-sm">{game.date}</div>
                      </div>
                      <div className={`font-bold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                        {game.result === 'win' ? '+' : '-'}${game.amount}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No recent games
                  </div>
                )}
              </div>
            </div>

            {/* Active Games */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Live Games
              </h3>
              <div className="space-y-3">
                {activeGames.length > 0 ? (
                  activeGames.map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{game.type}</div>
                        <div className="text-gray-400 text-sm">{game.players} players</div>
                      </div>
                      <div className="text-primary-400 font-medium">
                        ${game.pot}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No active games
                  </div>
                )}
              </div>
            </div>

            {/* Global Chat */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Global Chat</h3>
              <div className="h-64">
                <ChatPanel />
              </div>
            </div>

            {/* Live Feed */}
            <div>
              <LiveFeed />
            </div>

            {/* Referral System */}
            <div>
              <ReferralSystem />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
