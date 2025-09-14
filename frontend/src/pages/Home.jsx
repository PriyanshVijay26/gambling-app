import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Users, 
  TrendingUp, 
  Shield,
  Bomb,
  Coins,
  Zap,
  Target,
  Dice6,
  Triangle,
  Building2
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Gamepad2,
      title: 'Multiple Games',
      description: 'Enjoy 9 different games including Mines, Crash, Dice, Plinko, Towers and more'
    },
    {
      icon: Users,
      title: 'P2P Gaming',
      description: 'Play directly against other players in real-time multiplayer matches'
    },
    {
      icon: TrendingUp,
      title: 'Live Statistics',
      description: 'Track your performance with detailed stats and game history'
    },
    {
      icon: Shield,
      title: 'Fair Play',
      description: 'Provably fair algorithms ensure every game is random and transparent'
    }
  ];

  const games = [
    {
      name: 'Mines',
      description: 'Navigate through a field of hidden mines to multiply your bet',
      icon: Bomb,
      color: 'from-red-500 to-red-700',
      href: '/games/mines'
    },
    {
      name: 'Coin Flip',
      description: 'Simple heads or tails betting with instant results',
      icon: Coins,
      color: 'from-yellow-500 to-yellow-700',
      href: '/games/coinflip'
    },
    {
      name: 'Limbo',
      description: 'Aim for the highest multiplier before the limit',
      icon: TrendingUp,
      color: 'from-green-500 to-green-700',
      href: '/games/limbo'
    },
    {
      name: 'Crash',
      description: 'Cash out before the multiplier crashes',
      icon: Zap,
      color: 'from-orange-500 to-orange-700',
      href: '/games/crash'
    },
    {
      name: 'Upgrader',
      description: 'Upgrade your items with increasing multipliers',
      icon: Target,
      color: 'from-purple-500 to-purple-700',
      href: '/games/upgrader'
    },
    {
      name: 'Murder Mystery',
      description: 'Roblox-inspired P2P battles with roles and strategy',
      icon: Gamepad2,
      color: 'from-pink-500 to-pink-700',
      href: '/games/murder-mystery'
    },
    {
      name: 'Dice',
      description: 'Roll over or under your target number',
      icon: Dice6,
      color: 'from-blue-500 to-blue-700',
      href: '/games/dice'
    },
    {
      name: 'Plinko',
      description: 'Drop the ball and watch it bounce to riches',
      icon: Triangle,
      color: 'from-indigo-500 to-indigo-700',
      href: '/games/plinko'
    },
    {
      name: 'Towers',
      description: 'Climb the tower, avoid the traps',
      icon: Building2,
      color: 'from-emerald-500 to-emerald-700',
      href: '/games/towers'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome to the Ultimate
              <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Gaming Experience
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of Roblox-style P2P gambling with multiple games, 
              real-time multiplayer action, and fair play guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="btn-primary">
                Get Started
              </Link>
              <Link to="/games/mines" className="btn-secondary">
                Try Mines Game
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with modern technology for the best gaming experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-primary-500 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Game
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Multiple exciting games with unique mechanics and strategies
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={game.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Link to={game.href} className="block">
                    <div className="game-card p-6 h-full">
                      <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                      <p className="text-gray-400 mb-4">{game.description}</p>
                      <div className="text-primary-400 font-semibold group-hover:text-primary-300 transition-colors duration-200">
                        Play Now →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/30 to-primary-800/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Gaming?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of players in exciting P2P games with fair play and instant results
            </p>
            <Link to="/dashboard" className="btn-primary">
              Enter Gaming Lobby
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
