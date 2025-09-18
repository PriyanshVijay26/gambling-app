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
  Building2,
  Shield
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import FairnessAndLeaderboard from '../components/FairnessAndLeaderboard';
import ClientSeedWidget from '../components/ClientSeedWidget';
import FairnessRevealPanel from '../components/FairnessRevealPanel';
import ChatPanel from '../components/ChatPanel';
import ReferralSystem from '../components/ReferralSystem';
import FloatingParticles from '../components/FloatingParticles';
import VIPLoyaltyPanel from '../components/vip/VIPLoyaltyPanel';
import TournamentSystem from '../components/tournament/TournamentSystem';
import PromotionalSystem from '../components/promotions/PromotionalSystem';
import RakebackSystem from '../components/rakeback/RakebackSystem';
import PaymentSystem from '../components/payments/PaymentSystem';
import BankingSystem from '../components/banking/BankingSystem';
import AdvancedGameCard from '../components/ui/AdvancedGameCard';
import EnhancedLiveFeed from '../components/ui/EnhancedLiveFeed';
import { GameCardSkeleton, StaggerContainer, StaggerItem } from '../components/ui/LoadingStates';
import '../styles/game-placeholders.css';
import '../styles/casino-effects.css';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    winRate: 0,
    totalWinnings: 0,
    currentStreak: 0
  });
  const [recentGames, setRecentGames] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [activeTab, setActiveTab] = useState('games'); // games, vip, tournaments, promotions, payments, banking
  const { socket, connected } = useSocket();

  const games = [
    {
      name: 'Mines',
      icon: Bomb,
      image: '/images/games/mines.png',
      color: 'from-red-500 to-red-700',
      className: 'mines',
      href: '/games/mines',
      players: 24,
      status: 'active'
    },
    {
      name: 'Coin Flip',
      icon: Coins,
      image: '/images/games/coinflip.png',
      color: 'from-yellow-500 to-yellow-700',
      className: 'coinflip',
      href: '/games/coinflip',
      players: 18,
      status: 'active'
    },
    {
      name: 'Limbo',
      icon: TrendingUp,
      image: '/images/games/limbo.png',
      color: 'from-green-500 to-green-700',
      className: 'limbo',
      href: '/games/limbo',
      players: 12,
      status: 'active'
    },
    {
      name: 'Crash',
      icon: Zap,
      image: '/images/games/crash.png',
      color: 'from-orange-500 to-orange-700',
      className: 'crash',
      href: '/games/crash',
      players: 31,
      status: 'active'
    },
    {
      name: 'Upgrader',
      icon: Target,
      image: '/images/games/upgrader.png',
      color: 'from-purple-500 to-purple-700',
      className: 'upgrader',
      href: '/games/upgrader',
      players: 8,
      status: 'active'
    },
    {
      name: 'Murder Mystery',
      icon: Gamepad2,
      image: '/images/games/murder-mystery.png',
      color: 'from-pink-500 to-pink-700',
      className: 'murder-mystery',
      href: '/games/murder-mystery',
      players: 16,
      status: 'waiting'
    },
    {
      name: 'Dice',
      icon: Dice6,
      image: '/images/games/dice.png',
      color: 'from-blue-500 to-blue-700',
      className: 'dice',
      href: '/games/dice',
      players: 9,
      status: 'active'
    },
    {
      name: 'Plinko',
      icon: Triangle,
      image: '/images/games/plinko.png',
      color: 'from-indigo-500 to-indigo-700',
      className: 'plinko',
      href: '/games/plinko',
      players: 14,
      status: 'active'
    },
    {
      name: 'Towers',
      icon: Building2,
      image: '/images/games/towers.png',
      color: 'from-emerald-500 to-emerald-700',
      className: 'towers',
      href: '/games/towers',
      players: 7,
      status: 'active'
    }
  ];

  useEffect(() => {
    // Simulate loading time for better UX
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    if (socket && connected) {
      // Request dashboard data
      socket.emit('getDashboardData');
      
      socket.on('dashboardData', (data) => {
        setStats(data.stats);
        setRecentGames(data.recentGames);
        setActiveGames(data.activeGames);
        setIsLoading(false);
      });

      return () => {
        socket.off('dashboardData');
        clearTimeout(loadingTimer);
      };
    }

    return () => clearTimeout(loadingTimer);
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
    <div className="min-h-screen pt-8 pb-16 relative">
      <FloatingParticles count={25} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Gaming Dashboard
              </h1>
              <p className="text-xl text-gray-400">
                Track your performance and join live games
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-white font-medium">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex gap-2 mb-12 overflow-x-auto pb-2"
        >
          {[
            { id: 'games', label: 'Games', icon: Gamepad2 },
            { id: 'vip', label: 'VIP & Loyalty', icon: Trophy },
            { id: 'tournaments', label: 'Tournaments', icon: Trophy },
            { id: 'promotions', label: 'Promotions', icon: Coins },
            { id: 'payments', label: 'Payments', icon: TrendingUp },
            { id: 'banking', label: 'Banking & KYC', icon: Building2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -4 }}
                className="stats-card"
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon className={`w-10 h-10 ${stat.color}`} />
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <h3 className="text-gray-400 font-medium">{stat.title}</h3>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'games' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Games Grid */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Available Games</h2>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {isLoading ? (
                    // Show skeleton loading
                    [...Array(6)].map((_, index) => (
                      <StaggerItem key={index}>
                        <GameCardSkeleton />
                      </StaggerItem>
                    ))
                  ) : (
                    games.map((game, index) => (
                      <StaggerItem key={game.name}>
                        <AdvancedGameCard 
                          game={game} 
                          index={index} 
                          featured={game.name === 'Mines' || game.name === 'Crash'}
                        />
                      </StaggerItem>
                    ))
                  )}
                </StaggerContainer>
              </motion.div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-8"
              >
                {/* Fairness + Leaderboard */}
                <div className="sidebar-panel">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-blue-400" />
                    Fairness & Leaderboard
                  </h3>
                  <div className="space-y-6">
                    <FairnessAndLeaderboard />
                    <ClientSeedWidget />
                    <FairnessRevealPanel onReveal={(seed) => console.log('Revealed seed:', seed)} />
                  </div>
                </div>
                
                {/* Recent Games */}
                <div className="sidebar-panel">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-purple-400" />
                    Recent Games
                  </h3>
                  <div className="space-y-4">
                    {recentGames.length > 0 ? (
                      recentGames.map((game, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <div className="text-white font-medium">{game.type}</div>
                            <div className="text-gray-400 text-sm">{game.date}</div>
                          </div>
                          <div className={`font-bold text-lg ${
                            game.result === 'win' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {game.result === 'win' ? '+' : '-'}${game.amount}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center py-8 bg-white/5 rounded-xl border border-white/10">
                        No recent games
                      </div>
                    )}
                  </div>
                </div>

                {/* Global Chat */}
                <div className="sidebar-panel">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-green-400" />
                    Global Chat
                  </h3>
                  <div className="h-80">
                    <ChatPanel />
                  </div>
                </div>

                {/* Live Feed */}
                <div>
                  <EnhancedLiveFeed />
                </div>

                {/* Referral System */}
                <div>
                  <ReferralSystem />
                </div>
              </motion.div>
            </div>
          )}
          
          {activeTab === 'vip' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <VIPLoyaltyPanel user={null} socket={socket} />
            </motion.div>
          )}
          
          {activeTab === 'tournaments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <TournamentSystem user={null} socket={socket} />
            </motion.div>
          )}
          
          {activeTab === 'promotions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <PromotionalSystem user={null} socket={socket} />
            </motion.div>
          )}
          
          {activeTab === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            >
              <PaymentSystem socket={socket} />
              <RakebackSystem socket={socket} />
            </motion.div>
          )}
          
          {activeTab === 'banking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <BankingSystem socket={socket} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
