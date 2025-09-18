import React, { useState } from 'react';
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
  Building2,
  Star,
  PlayCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import PromoCarousel from '../components/PromoCarousel';
import FloatingParticles from '../components/FloatingParticles';
import '../styles/game-placeholders.css';

const Home = () => {
  const [failedImages, setFailedImages] = useState(new Set());
  const features = [
    {
      icon: Gamepad2,
      title: 'Premium Games',
      description: 'Experience 9 meticulously crafted games with cutting-edge mechanics'
    },
    {
      icon: Users,
      title: 'P2P Gaming',
      description: 'Compete in real-time against players worldwide with instant matchmaking'
    },
    {
      icon: TrendingUp,
      title: 'Live Analytics',
      description: 'Track performance with detailed statistics and advanced insights'
    },
    {
      icon: Shield,
      title: 'Provably Fair',
      description: 'Transparent algorithms with cryptographic verification for every game'
    }
  ];

  const games = [
    {
      name: 'Mines',
      description: 'Navigate through a field of hidden mines to multiply your bet',
      icon: Bomb,
      image: '/images/games/mines.png',
      color: 'from-red-500 to-red-700',
      className: 'mines',
      href: '/games/mines',
      featured: true
    },
    {
      name: 'Coin Flip',
      description: 'Simple heads or tails betting with instant results',
      icon: Coins,
      image: '/images/games/coinflip.png',
      color: 'from-yellow-500 to-yellow-700',
      className: 'coinflip',
      href: '/games/coinflip'
    },
    {
      name: 'Limbo',
      description: 'Aim for the highest multiplier before the limit',
      icon: TrendingUp,
      image: '/images/games/limbo.png',
      color: 'from-green-500 to-green-700',
      className: 'limbo',
      href: '/games/limbo'
    },
    {
      name: 'Crash',
      description: 'Cash out before the multiplier crashes',
      icon: Zap,
      image: '/images/games/crash.png',
      color: 'from-orange-500 to-orange-700',
      className: 'crash',
      href: '/games/crash',
      featured: true
    },
    {
      name: 'Upgrader',
      description: 'Upgrade your items with increasing multipliers',
      icon: Target,
      image: '/images/games/upgrader.png',
      color: 'from-purple-500 to-purple-700',
      className: 'upgrader',
      href: '/games/upgrader'
    },
    {
      name: 'Murder Mystery',
      description: 'Roblox-inspired P2P battles with roles and strategy',
      icon: Gamepad2,
      image: '/images/games/murder-mystery.png',
      color: 'from-pink-500 to-pink-700',
      className: 'murder-mystery',
      href: '/games/murder-mystery'
    },
    {
      name: 'Dice',
      description: 'Roll over or under your target number',
      icon: Dice6,
      image: '/images/games/dice.png',
      color: 'from-blue-500 to-blue-700',
      className: 'dice',
      href: '/games/dice'
    },
    {
      name: 'Plinko',
      description: 'Drop the ball and watch it bounce to riches',
      icon: Triangle,
      image: '/images/games/plinko.png',
      color: 'from-indigo-500 to-indigo-700',
      className: 'plinko',
      href: '/games/plinko'
    },
    {
      name: 'Towers',
      description: 'Climb the tower, avoid the traps',
      icon: Building2,
      image: '/images/games/towers.png',
      color: 'from-emerald-500 to-emerald-700',
      className: 'towers',
      href: '/games/towers'
    }
  ];

  return (
    <div className="min-h-screen relative">
      <FloatingParticles count={30} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Next-Gen Gaming Platform</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Welcome to the</span>
              <br />
              <span className="text-gradient">Ultimate Gaming</span>
              <br />
              <span className="text-white">Experience</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the thrill of next-generation P2P gambling with cutting-edge games, 
              real-time multiplayer action, and mathematically provable fairness.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/dashboard" className="btn-primary group">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Playing
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/games/mines" className="btn-secondary group">
                <Bomb className="w-5 h-5 mr-2" />
                Try Mines Game
              </Link>
            </div>

            {/* Promo Carousel */}
            <div className="max-w-4xl mx-auto">
              <PromoCarousel />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built with cutting-edge technology for an unparalleled gaming experience
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
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="harvester-card p-8 text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your Adventure
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Nine unique games with distinct mechanics, strategies, and winning opportunities
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
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <Link to={game.href} className="block">
                    <div className={`${game.featured ? 'harvester-card-premium' : 'harvester-card'} p-8 h-full relative overflow-hidden`}>
                      {game.featured && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 text-sm font-medium">Featured</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Game Image/Icon */}
                      <div className="mb-6 relative">
                        {game.image && !failedImages.has(game.name) ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <img 
                              src={game.image} 
                              alt={game.name}
                              className="w-full h-full object-cover"
                              onError={() => {
                                setFailedImages(prev => new Set(prev).add(game.name));
                              }}
                            />
                          </div>
                        ) : (
                          <div className={`w-20 h-20 game-image-placeholder ${game.className} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <Icon className="w-10 h-10 text-white game-placeholder-icon" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4">{game.name}</h3>
                      <p className="text-gray-400 mb-6 leading-relaxed">{game.description}</p>
                      
                      <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors duration-200">
                        <span>Play Now</span>
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
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
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-500/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Join thousands of players in exciting P2P games with provable fairness and instant results
            </p>
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center justify-center px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 border border-blue-500/30 group mobile-cta-button"
                >
                  <PlayCircle className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  <span>Enter Gaming Lobby</span>
                  <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-2 duration-200" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
