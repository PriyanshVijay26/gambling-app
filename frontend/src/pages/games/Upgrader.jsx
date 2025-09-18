import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, DollarSign, ArrowUp, TrendingUp } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

// Isometric dot pattern background
const IsometricDotBackground = () => {
  const dotSize = 2;
  const spacing = 20;
  
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      <svg 
        width="100%" 
        height="100%" 
        className="absolute inset-0"
        style={{ background: '#000000' }}
      >
        <defs>
          <pattern id="upgraderIsometricDots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle 
              cx={spacing/2} 
              cy={spacing/2} 
              r={dotSize/2} 
              fill="rgba(255,255,255,0.1)" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#upgraderIsometricDots)" />
        
        {/* Additional isometric grid lines */}
        <defs>
          <pattern id="upgraderIsometricGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 20 L 20 0 L 40 20 L 20 40 Z" 
              fill="none" 
              stroke="rgba(138, 43, 226, 0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#upgraderIsometricGrid)" />
      </svg>
    </div>
  );
};

const Upgrader = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { socket, connected } = useSocket();

  const upgradeChances = {
    1: 90, 2: 80, 3: 70, 4: 60, 5: 50,
    6: 40, 7: 30, 8: 20, 9: 10, 10: 5
  };

  const multipliers = {
    1: 1.1, 2: 1.2, 3: 1.4, 4: 1.6, 5: 2.0,
    6: 2.5, 7: 3.0, 8: 4.0, 9: 5.0, 10: 10.0
  };

  const startGame = () => {
    if (!socket || !connected) return;
    setGameOver(false);
    setGameState(null);
    setFair(null);
    socket.emit('upgrader:start', { betAmount });
  };

  const tryUpgrade = () => {
    if (!socket || !connected || !gameState) return;
    setIsUpgrading(true);
    socket.emit('upgrader:upgrade');
  };

  const cashOut = () => {
    if (!socket || !connected || !gameState) return;
    socket.emit('upgrader:cashOut');
  };

  useEffect(() => {
    if (!socket) return;

    const onGameStarted = (state) => {
      setGameState(state);
      setGameOver(false);
    };

    const onUpgradeResult = (result) => {
      setGameState(result.gameState);
      setIsUpgrading(false);
      
      if (result.gameOver) {
        setGameOver(true);
        setFair(result.fair);
      }
    };

    const onCashOut = (result) => {
      setGameState(result.gameState);
      setGameOver(true);
      setFair(result.fair);
    };

    socket.on('upgrader:started', onGameStarted);
    socket.on('upgrader:result', onUpgradeResult);
    socket.on('upgrader:cashedOut', onCashOut);

    return () => {
      socket.off('upgrader:started', onGameStarted);
      socket.off('upgrader:result', onUpgradeResult);
      socket.off('upgrader:cashedOut', onCashOut);
    };
  }, [socket]);

  const getCurrentValue = () => {
    if (!gameState) return betAmount;
    let totalMultiplier = 1;
    for (let i = 1; i < gameState.currentLevel; i++) {
      totalMultiplier *= multipliers[i];
    }
    return betAmount * totalMultiplier;
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🎯 Upgrader</h1>
          <p className="text-gray-400 text-lg">Upgrade your items with increasing multipliers</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Visualization */}
          <div className="lg:col-span-2">
            <div 
              className="relative rounded-xl border-2 border-slate-600 overflow-hidden"
              style={{ 
                height: '400px',
                background: '#000000',
                boxShadow: '0 0 40px rgba(138, 43, 226, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Isometric dot background */}
              <IsometricDotBackground />
              
              {/* Game content */}
              <div className="relative h-full p-6 flex items-center justify-center" style={{ zIndex: 10 }}>
                {/* Level display in styled box */}
                <motion.div 
                  className="relative"
                  animate={{ 
                    scale: isUpgrading ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: isUpgrading ? Infinity : 0 
                  }}
                >
                  {/* Styled container box */}
                  <div 
                    className="relative px-8 py-6 border-2 bg-black/80 backdrop-blur-sm"
                    style={{
                      borderColor: gameOver 
                        ? (gameState?.won ? '#8b5cf6' : '#ef4444') 
                        : isUpgrading 
                        ? '#8b5cf6' 
                        : '#666666',
                      borderRadius: '12px',
                      boxShadow: gameOver 
                        ? (gameState?.won 
                          ? '0 0 30px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.1)'
                          : '0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.1)')
                        : isUpgrading 
                        ? '0 0 30px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.1)'
                        : '0 0 20px rgba(102, 102, 102, 0.3)'
                    }}
                  >
                    {/* Corner decorations */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                    
                    {/* Level display */}
                    <motion.div
                      className={`text-5xl font-bold mb-2 text-center ${
                        gameOver 
                          ? (gameState?.won ? 'text-purple-400' : 'text-red-400')
                          : 'text-white'
                      }`}
                      style={{
                        textShadow: gameOver
                          ? (gameState?.won 
                            ? '0 0 20px #8b5cf6, 0 0 40px #8b5cf6'
                            : '0 0 20px #ef4444, 0 0 40px #ef4444')
                          : isUpgrading 
                          ? '0 0 20px #8b5cf6, 0 0 40px #8b5cf6' 
                          : '0 0 20px #ffffff',
                        fontFamily: 'monospace'
                      }}
                      animate={isUpgrading ? {
                        textShadow: [
                          '0 0 20px #8b5cf6, 0 0 40px #8b5cf6',
                          '0 0 30px #8b5cf6, 0 0 60px #8b5cf6',
                          '0 0 20px #8b5cf6, 0 0 40px #8b5cf6'
                        ]
                      } : {}}
                      transition={{ duration: 1, repeat: isUpgrading ? Infinity : 0 }}
                    >
                      LEVEL {gameState ? gameState.currentLevel : 1}
                    </motion.div>
                    
                    {/* Status text */}
                    <div className={`text-center text-sm font-semibold uppercase tracking-wider ${
                      gameOver 
                        ? (gameState?.won ? 'text-purple-300' : 'text-red-300')
                        : 'text-cyan-400'
                    }`}>
                      {isUpgrading ? 'UPGRADING...' : 
                       gameOver ? (gameState?.won ? 'SUCCESS!' : 'FAILED!') : 
                       'READY TO UPGRADE'}
                    </div>
                    
                    {/* Level progress grid */}
                    <div className="mt-4">
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <motion.div
                            key={i}
                            className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-bold ${
                              i + 1 <= (gameState ? gameState.currentLevel : 1)
                                ? 'bg-purple-500 border-purple-400 text-white'
                                : 'border-slate-500 text-slate-400'
                            }`}
                            animate={{
                              scale: i + 1 === (gameState ? gameState.currentLevel : 1) ? [1, 1.1, 1] : 1
                            }}
                            transition={{ duration: 0.5, repeat: isUpgrading ? Infinity : 0 }}
                          >
                            {i + 1}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Animated border glow */}
                    {isUpgrading && (
                      <motion.div
                        className="absolute inset-0 border-2 rounded-xl"
                        style={{ borderColor: '#8b5cf6' }}
                        animate={{
                          opacity: [0.3, 0.8, 0.3],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 space-y-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Initial Bet</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    disabled={gameState && !gameOver}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-3 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Level</span>
                  <span className="text-purple-400 font-bold">
                    Level {gameState ? gameState.currentLevel : 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Chance</span>
                  <span className="text-green-400 font-bold">
                    {upgradeChances[gameState ? gameState.currentLevel : 1]}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Value</span>
                  <span className="text-yellow-400 font-bold">
                    ${getCurrentValue().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {!gameState && !gameOver && (
                  <motion.button
                    onClick={startGame}
                    disabled={!connected}
                    className="w-full btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🎯 Start Game
                  </motion.button>
                )}

                {gameState && !gameOver && gameState.currentLevel < 10 && (
                  <motion.button
                    onClick={tryUpgrade}
                    disabled={isUpgrading}
                    className="w-full btn-primary flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ 
                      boxShadow: !isUpgrading ? ['0 0 20px rgba(139, 92, 246, 0.5)', '0 0 30px rgba(139, 92, 246, 0.8)', '0 0 20px rgba(139, 92, 246, 0.5)'] : '0 0 20px rgba(139, 92, 246, 0.5)'
                    }}
                    transition={{ duration: 1, repeat: !isUpgrading ? Infinity : 0 }}
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    {isUpgrading ? '🔄 Upgrading...' : `⬆️ Upgrade (${upgradeChances[gameState?.currentLevel || 1]}%)`}
                  </motion.button>
                )}

                {gameState && !gameOver && gameState.currentLevel > 1 && (
                  <motion.button 
                    onClick={cashOut} 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    💰 Cash Out ${getCurrentValue().toFixed(2)}
                  </motion.button>
                )}

                {gameOver && (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {gameState && (
                        <motion.div 
                          className="p-4 bg-slate-700/50 rounded-lg"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className={`text-lg font-bold mb-2 ${gameState.won ? 'text-purple-400' : 'text-red-400'}`}>
                            {gameState.won ? (
                              gameState.reason === 'cashout' 
                                ? `🎉 Cashed Out: $${gameState.winnings.toFixed(2)}!`
                                : `🎆 Max Level Reached: $${gameState.winnings.toFixed(2)}!`
                            ) : (
                              `💥 Upgrade Failed! Lost $${betAmount.toFixed(2)}`
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            Final Level: {gameState.currentLevel} • Value: ${getCurrentValue().toFixed(2)}
                          </div>
                          {fair && (
                            <button onClick={() => setVerifyOpen(true)} className="text-sm text-blue-400 hover:text-blue-300">
                              Verify Fairness
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button 
                      onClick={startGame} 
                      className="w-full btn-secondary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🎮 New Game
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={() => setVerifyOpen(false)} fair={fair} game={{ type: 'upgrader' }} />
    </div>
  );
};

export default Upgrader;