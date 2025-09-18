import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  LayoutDashboard, 
  Gamepad2, 
  Menu, 
  X,
  Zap,
  Target,
  TrendingUp,
  Bomb,
  Coins,
  Dice6,
  Triangle,
  Building2,
  Users,
  Settings,
  BarChart3,
  Gift
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import '../../styles/game-placeholders.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const location = useLocation();
  const { connected, user, setAuthModalOpen } = useSocket();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Cases', href: '/cases', icon: Gift },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Statistics', href: '/stats', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const games = [
    { name: 'Mines', href: '/games/mines', icon: Bomb, color: 'text-red-400', image: '/images/games/mines.png', className: 'mines' },
    { name: 'Enhanced Mines', href: '/enhanced-mines', icon: Bomb, color: 'text-red-500', image: '/images/games/mines.png', className: 'mines' },
    { name: 'Coin Flip', href: '/games/coinflip', icon: Coins, color: 'text-yellow-400', image: '/images/games/coinflip.png', className: 'coinflip' },
    { name: 'Limbo', href: '/games/limbo', icon: TrendingUp, color: 'text-green-400', image: '/images/games/limbo.png', className: 'limbo' },
    { name: 'Crash', href: '/games/crash', icon: Zap, color: 'text-orange-400', image: '/images/games/crash.png', className: 'crash' },
    { name: 'Upgrader', href: '/games/upgrader', icon: Target, color: 'text-purple-400', image: '/images/games/upgrader.png', className: 'upgrader' },
    { name: 'Murder Mystery', href: '/games/murder-mystery', icon: Gamepad2, color: 'text-pink-400', image: '/images/games/murder-mystery.png', className: 'murder-mystery' },
    { name: 'Dice', href: '/games/dice', icon: Dice6, color: 'text-blue-400', image: '/images/games/dice.png', className: 'dice' },
    { name: 'Plinko', href: '/games/plinko', icon: Triangle, color: 'text-indigo-400', image: '/images/games/plinko.png', className: 'plinko' },
    { name: 'Towers', href: '/games/towers', icon: Building2, color: 'text-emerald-400', image: '/images/games/towers.png', className: 'towers' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">
                GamePlatform
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item flex items-center space-x-2 ${
                    isActive(item.href) ? 'active' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Games Dropdown */}
            <div className="relative group">
              <button className="nav-item flex items-center space-x-2">
                <Gamepad2 className="w-5 h-5" />
                <span className="font-medium">Games</span>
              </button>
              
              <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-3">
                  {games.map((game) => {
                    const Icon = game.icon;
                    return (
                      <Link
                        key={game.name}
                        to={game.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive(game.href)
                            ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${game.color}`} />
                        <span className="font-medium">{game.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-300">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Guest Auth */}
            <button 
              onClick={() => setAuthModalOpen(true)} 
              className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-lg" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              )}
              <span className="font-medium">{user?.username || 'Set username'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-dark-300 border-t border-slate-700"
      >
        <div className="px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-2 border-t border-slate-700">
            <div className="text-sm font-medium text-gray-400 px-3 py-2">Games</div>
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Link
                  key={game.name}
                  to={game.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(game.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${game.color}`} />
                  <span className="font-medium">{game.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
