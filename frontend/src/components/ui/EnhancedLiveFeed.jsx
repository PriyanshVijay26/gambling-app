import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Zap, 
  DollarSign,
  Eye,
  Star,
  Flame
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const EnhancedLiveFeed = () => {
  const [wins, setWins] = useState([]);
  const [stats, setStats] = useState({
    totalWagered: 0,
    totalPlayers: 0,
    biggestWin: 0,
    liveMultiplier: 1.0
  });
  const [failedImages, setFailedImages] = useState(new Set());
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      // Demo data - replace with real socket events
      const demoWins = [
        { id: 1, username: 'CryptoKing', game: 'crash', amount: 1250.50, multiplier: 5.2, timestamp: Date.now() - 30000, userAvatar: null },
        { id: 2, username: 'LuckyStrike', game: 'mines', amount: 890.25, multiplier: 3.8, timestamp: Date.now() - 60000, userAvatar: null },
        { id: 3, username: 'DiamondHands', game: 'limbo', amount: 2100.75, multiplier: 7.1, timestamp: Date.now() - 90000, userAvatar: null },
      ];
      
      setWins(demoWins);
      
      // Simulate live stats updates
      const interval = setInterval(() => {
        setStats(prev => ({
          totalWagered: prev.totalWagered + Math.random() * 100,
          totalPlayers: 450 + Math.floor(Math.random() * 50),
          biggestWin: Math.max(prev.biggestWin, Math.random() * 5000),
          liveMultiplier: 1 + Math.random() * 2
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [socket]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const winTime = new Date(timestamp);
    const diffMs = now - winTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getGameImage = (game) => {
    const gameImages = {
      mines: '/images/games/mines.png',
      coinflip: '/images/games/coinflip.png',
      limbo: '/images/games/limbo.png',
      crash: '/images/games/crash.png',
      upgrader: '/images/games/upgrader.png',
      'murder-mystery': '/images/games/murder-mystery.png',
      dice: '/images/games/dice.png',
      plinko: '/images/games/plinko.png',
      towers: '/images/games/towers.png'
    };
    return gameImages[game];
  };

  const getGameClass = (game) => {
    const gameClasses = {
      mines: 'mines',
      coinflip: 'coinflip',
      limbo: 'limbo',
      crash: 'crash',
      upgrader: 'upgrader',
      'murder-mystery': 'murder-mystery',
      dice: 'dice',
      plinko: 'plinko',
      towers: 'towers'
    };
    return gameClasses[game] || 'default';
  };

  const getGameEmoji = (game) => {
    const gameEmojis = {
      mines: '💣',
      coinflip: '🪙',
      limbo: '📈',
      crash: '⚡',
      upgrader: '🎯',
      'murder-mystery': '🎮',
      dice: '🎲',
      plinko: '🔺',
      towers: '🏗️'
    };
    return gameEmojis[game] || '🎰';
  };

  return (
    <div className="space-y-6">
      {/* Live Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-teal-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(20, 184, 166, 0.1))',
              'linear-gradient(45deg, rgba(20, 184, 166, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))',
              'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(20, 184, 166, 0.1), rgba(147, 51, 234, 0.1))'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white">Live Platform Stats</h3>
            <motion.div
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-white mb-1"
                key={stats.totalWagered}
                initial={{ scale: 1.2, color: '#60a5fa' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                ${stats.totalWagered.toFixed(0)}
              </motion.div>
              <div className="text-sm text-gray-400">Total Wagered</div>
            </div>
            
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-white mb-1"
                key={stats.totalPlayers}
                initial={{ scale: 1.2, color: '#10b981' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                {stats.totalPlayers}
              </motion.div>
              <div className="text-sm text-gray-400">Players Online</div>
            </div>
            
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-white mb-1"
                key={stats.biggestWin}
                initial={{ scale: 1.2, color: '#f59e0b' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                ${stats.biggestWin.toFixed(0)}
              </motion.div>
              <div className="text-sm text-gray-400">Biggest Win</div>
            </div>
            
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-white mb-1"
                key={stats.liveMultiplier}
                initial={{ scale: 1.2, color: '#8b5cf6' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                {stats.liveMultiplier.toFixed(1)}x
              </motion.div>
              <div className="text-sm text-gray-400">Live Multiplier</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Big Wins Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Flame className="w-6 h-6 text-orange-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white">Big Wins</h3>
            <motion.div
              className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/50 rounded-full"
              animate={{ 
                boxShadow: [
                  '0 0 10px rgba(251, 146, 60, 0.3)',
                  '0 0 20px rgba(251, 146, 60, 0.5)',
                  '0 0 10px rgba(251, 146, 60, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-orange-300 text-sm font-medium">Live</span>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{wins.length} recent</span>
          </div>
        </div>

        {/* Wins List */}
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {wins.map((win, index) => (
              <motion.div
                key={`${win.id}-${win.timestamp}`}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  delay: index * 0.1 
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 hover:border-gray-500/70 transition-all duration-300 relative overflow-hidden"
              >
                {/* Win Amount Glow Effect */}
                {win.amount > 1000 && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Game Icon/Image */}
                    <div className="relative">
                      {getGameImage(win.game) && !failedImages.has(win.game) ? (
                        <img 
                          src={getGameImage(win.game)} 
                          alt={win.game}
                          className="w-12 h-12 rounded-xl object-cover shadow-lg"
                          onError={() => {
                            setFailedImages(prev => new Set(prev).add(win.game));
                          }}
                        />
                      ) : (
                        <div className={`w-12 h-12 game-image-placeholder ${getGameClass(win.game)} rounded-xl flex items-center justify-center shadow-lg`}>
                          <span className="text-lg">{getGameEmoji(win.game)}</span>
                        </div>
                      )}
                      
                      {/* Multiplier Badge */}
                      {win.multiplier && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[40px] text-center"
                        >
                          {win.multiplier}x
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {win.userAvatar && (
                          <img src={win.userAvatar} alt="avatar" className="w-5 h-5 rounded-full" />
                        )}
                        <span className="text-white font-semibold">{win.username}</span>
                        {win.amount > 2000 && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="capitalize">{win.game.replace('-', ' ')}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(win.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Win Amount */}
                  <div className="text-right">
                    <motion.div
                      className={`text-xl font-bold ${
                        win.amount > 2000 ? 'text-yellow-400' : 
                        win.amount > 1000 ? 'text-green-400' : 'text-blue-400'
                      }`}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      ${win.amount.toFixed(2)}
                    </motion.div>
                    {win.multiplier && (
                      <div className="text-sm text-gray-400">
                        {win.multiplier}x multiplier
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {wins.length === 0 && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 text-gray-400"
            >
              <DollarSign className="w-full h-full" />
            </motion.div>
            <p className="text-gray-400 mb-2">Waiting for big wins...</p>
            <p className="text-sm text-gray-500">Be the first to hit it big!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EnhancedLiveFeed;