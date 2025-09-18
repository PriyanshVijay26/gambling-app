import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Clock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import '../styles/game-placeholders.css';

const LiveFeed = () => {
  const [wins, setWins] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const onBigWin = (winData) => {
      setWins(prev => [winData, ...prev].slice(0, 10)); // Keep last 10 wins
    };

    socket.on('big-win', onBigWin);
    
    // Request recent wins on component mount
    socket.emit('get-recent-wins');
    socket.on('recent-wins', (recentWins) => {
      setWins(recentWins);
    });

    return () => {
      socket.off('big-win', onBigWin);
      socket.off('recent-wins');
    };
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

  const getGameIcon = (game) => {
    const gameIcons = {
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
    return gameIcons[game] || '🎰';
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

  if (wins.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">Live Big Wins</h3>
        </div>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">No big wins yet...</p>
          <p className="text-sm text-gray-500">Be the first to hit it big!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold text-white">Live Big Wins</h3>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {wins.map((win, index) => (
            <motion.div
              key={`${win.id}-${win.timestamp}`}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  {getGameImage(win.game) && !failedImages.has(win.game) ? (
                    <img 
                      src={getGameImage(win.game)} 
                      alt={win.game}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(win.game));
                      }}
                    />
                  ) : (
                    <div className={`w-8 h-8 game-image-placeholder ${getGameClass(win.game)} rounded-lg flex items-center justify-center text-sm`}>
                      {getGameIcon(win.game)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {win.userAvatar && (
                      <img src={win.userAvatar} alt="avatar" className="w-4 h-4 rounded" />
                    )}
                    <span className="text-white font-medium text-sm">
                      {win.username || 'Anonymous'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {win.game.replace('-', ' ')}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-green-400 font-bold">
                  ${win.amount.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatTime(win.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {wins.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">Waiting for big wins...</p>
        </div>
      )}
    </div>
  );
};

export default LiveFeed;