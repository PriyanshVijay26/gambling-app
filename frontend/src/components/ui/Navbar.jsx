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
  Building2
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import GuestAuthModal from '../GuestAuthModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { connected, user } = useSocket();
  const [authOpen, setAuthOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  const games = [
    { name: 'Mines', href: '/games/mines', icon: Bomb, color: 'text-red-400' },
    { name: 'Coin Flip', href: '/games/coinflip', icon: Coins, color: 'text-yellow-400' },
    { name: 'Limbo', href: '/games/limbo', icon: TrendingUp, color: 'text-green-400' },
    { name: 'Crash', href: '/games/crash', icon: Zap, color: 'text-orange-400' },
    { name: 'Upgrader', href: '/games/upgrader', icon: Target, color: 'text-purple-400' },
    { name: 'Murder Mystery', href: '/games/murder-mystery', icon: Gamepad2, color: 'text-pink-400' },
    { name: 'Dice', href: '/games/dice', icon: Dice6, color: 'text-blue-400' },
    { name: 'Plinko', href: '/games/plinko', icon: Triangle, color: 'text-indigo-400' },
    { name: 'Towers', href: '/games/towers', icon: Building2, color: 'text-emerald-400' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-dark-200 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                GamePlatform
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
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

            {/* Games Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-200">
                <Gamepad2 className="w-4 h-4" />
                <span className="font-medium">Games</span>
              </button>
              
              <div className="absolute top-full left-0 mt-2 w-56 bg-dark-200 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  {games.map((game) => {
                    const Icon = game.icon;
                    return (
                      <Link
                        key={game.name}
                        to={game.href}
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
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Guest Auth */}
            <button onClick={()=>setAuthOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded" />
              ) : (
                <div className="w-6 h-6 bg-slate-700 rounded" />
              )}
              <span className="text-sm">{user?.username || 'Set username'}</span>
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
      <GuestAuthModal open={authOpen} onClose={()=>setAuthOpen(false)} />
    </nav>
  );
};

export default Navbar;
