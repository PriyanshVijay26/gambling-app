import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
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
  const [showAllGames, setShowAllGames] = useState(false);
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
    <>
      <nav className="bg-black/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 mobile-navbar-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mobile-safe-area">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gradient hidden xs:block">
                  GamePlatform
                </span>
                <span className="text-lg font-bold text-gradient xs:hidden">
                  GP
                </span>
              </Link>
            </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item flex items-center space-x-2 ${isActive(item.href) ? 'active' : ''}`}
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

            {/* Connection Status & User */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-gray-300">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-lg" />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                )}
                <span className="font-medium text-sm">{user?.username || 'Set username'}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile User Avatar */}
            <button 
              onClick={() => setAuthModalOpen(true)} 
              className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-2"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded" />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
              )}
            </button>
            
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Navigation Portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Mobile Navigation Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  setIsOpen(false);
                  setShowAllGames(false); // Reset games view when closing
                }}
              />
              
              {/* Mobile Navigation Sidebar */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto mobile-sidebar mobile-safe-area"
              >
                <div className="p-4">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-white">GamePlatform</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setShowAllGames(false); // Reset games view when closing
                      }}
                      className="text-gray-300 hover:text-white p-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Connection Status */}
                  <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm text-gray-300">
                      {connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  {/* User Profile */}
                  <button 
                    onClick={() => {
                      setAuthModalOpen(true);
                      setIsOpen(false);
                      setShowAllGames(false); // Reset games view when closing
                    }} 
                    className="w-full flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 mb-6"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-lg" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                    )}
                    <div className="text-left">
                      <div className="font-medium">{user?.username || 'Set username'}</div>
                      <div className="text-xs text-gray-400">Tap to edit profile</div>
                    </div>
                  </button>

                  {/* Navigation Links */}
                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</div>
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => {
                            setIsOpen(false);
                            setShowAllGames(false); // Reset games view when navigating
                          }}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                            isActive(item.href)
                              ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* Games Section */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Games</div>
                    <motion.div
                      animate={{ height: 'auto' }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      {(showAllGames ? games : games.slice(0, 6)).map((game) => {
                        const Icon = game.icon;
                        return (
                          <motion.div
                            key={game.name}
                            initial={showAllGames && games.indexOf(game) >= 6 ? { opacity: 0, y: 10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: showAllGames && games.indexOf(game) >= 6 ? (games.indexOf(game) - 6) * 0.05 : 0 }}
                          >
                            <Link
                              to={game.href}
                              onClick={() => {
                                setIsOpen(false);
                                setShowAllGames(false); // Reset games view when navigating
                              }}
                              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                                isActive(game.href)
                                  ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${game.color}`} />
                              <span className="font-medium">{game.name}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                    
                    {games.length > 6 && (
                      <div className="text-center pt-2">
                        <button 
                          onClick={() => setShowAllGames(!showAllGames)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          {showAllGames ? `Show Less` : `View All Games (${games.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Navbar;
