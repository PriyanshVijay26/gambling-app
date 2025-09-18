import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, DollarSign, ArrowUp, TrendingUp } from 'lucide-react';
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
          <pattern id="towersIsometricDots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle 
              cx={spacing/2} 
              cy={spacing/2} 
              r={dotSize/2} 
              fill="rgba(255,255,255,0.1)" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#towersIsometricDots)" />
        
        {/* Additional isometric grid lines */}
        <defs>
          <pattern id="towersIsometricGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 20 L 20 0 L 40 20 L 20 40 Z" 
              fill="none" 
              stroke="rgba(34, 197, 94, 0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#towersIsometricGrid)" />
      </svg>
    </div>
  );
};

const Towers = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { socket, connected } = useSocket();

  const resetGame = () => {
    setGameState(null);
    setIsPlaying(false);
    setFair(null);
  };

  const startGame = () => {
    if (!socket || !connected) return;
    resetGame(); // Clear previous game state
    socket.emit('towers:startGame', { betAmount, difficulty });
  };

  const selectBlock = (position) => {
    if (!socket || !connected || !isPlaying) return;
    console.log(`Selecting block at position ${position} for level ${gameState?.currentLevel}`);
    socket.emit('towers:selectBlock', { position });
  };

  const cashOut = () => {
    if (!socket || !connected || !isPlaying) return;
    socket.emit('towers:cashOut');
  };

  useEffect(() => {
    if (!socket) return;
    
    const onGameState = (state) => {
      console.log('Received game state:', state);
      setGameState(state);
      setIsPlaying(true);
    };

    const onBlockResult = (result) => {
      console.log('Received block result:', result);
      setGameState(result.gameState);
      if (result.gameOver) {
        setIsPlaying(false);
        setFair(result.fair);
      }
    };

    const onCashedOut = (result) => {
      setGameState(result.gameState);
      setIsPlaying(false);
      setFair(result.fair);
    };

    const onError = (error) => {
      console.error('Towers game error:', error);
      setIsPlaying(false);
    };

    socket.on('towers:gameState', onGameState);
    socket.on('towers:blockResult', onBlockResult);
    socket.on('towers:cashedOut', onCashedOut);
    socket.on('error', onError);

    return () => {
      socket.off('towers:gameState', onGameState);
      socket.off('towers:blockResult', onBlockResult);
      socket.off('towers:cashedOut', onCashedOut);
      socket.off('error', onError);
    };
  }, [socket]);

  const difficultySettings = {
    easy: { name: 'Easy', blocks: 2, safe: 1 },
    medium: { name: 'Medium', blocks: 3, safe: 1 },
    hard: { name: 'Hard', blocks: 4, safe: 1 }
  };

  const settings = difficultySettings[difficulty];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🏢 Towers</h1>
          <p className="text-gray-400 text-lg">Climb the tower, avoid the traps</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Game Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Bet Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      disabled={isPlaying}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(difficultySettings).map(([key, setting]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        disabled={isPlaying}
                        className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                          difficulty === key ? 'border-primary-500 bg-primary-500/20' : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-white font-semibold">{setting.name}</div>
                        <div className="text-xs text-gray-400">{setting.safe}/{setting.blocks} safe</div>
                      </button>
                    ))}
                  </div>
                </div>

                {gameState && (
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Level:</span>
                      <span className="text-white">{gameState.currentLevel + 1}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Current Multiplier:</span>
                      <span className="text-green-400">{gameState.multiplier.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential Win:</span>
                      <span className="text-green-400">${(betAmount * gameState.multiplier).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {!isPlaying && !gameState?.gameOver ? (
                  <motion.button
                    onClick={startGame}
                    disabled={!connected}
                    className="w-full btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🏢 Start Climbing
                  </motion.button>
                ) : isPlaying && !gameState?.gameOver ? (
                  <motion.button
                    onClick={cashOut}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(251, 191, 36, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(251, 191, 36, 0.3)',
                        '0 0 20px rgba(251, 191, 36, 0.6)',
                        '0 0 10px rgba(251, 191, 36, 0.3)'
                      ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    💰 Cash Out ${(betAmount * (gameState?.multiplier || 1)).toFixed(2)}
                  </motion.button>
                ) : gameState?.gameOver ? (
                  <motion.button
                    onClick={resetGame}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    🔄 Play Again
                  </motion.button>
                ) : null}

                {gameState?.gameOver && (
                  <motion.div 
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: gameState.won ? '#22c55e' : '#ef4444',
                      background: gameState.won ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <motion.div 
                      className={`text-lg font-bold mb-2 ${gameState.won ? 'text-green-400' : 'text-red-400'}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      {gameState.won 
                        ? `🎉 You Won $${gameState.winnings.toFixed(2)}!` 
                        : `💣 Game Over! You lost $${betAmount.toFixed(2)}`
                      }
                    </motion.div>
                    <motion.div 
                      className="text-sm text-gray-400 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Reached Level: {gameState.currentLevel || 0} • Final Multiplier: {gameState.multiplier.toFixed(2)}x
                    </motion.div>
                    {fair && (
                      <motion.button 
                        onClick={()=>setVerifyOpen(true)} 
                        className="text-sm text-green-400 hover:text-green-300 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🔍 Verify Fairness
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div 
              className="relative rounded-xl border-2 border-slate-600 overflow-hidden"
              style={{ 
                minHeight: '600px',
                background: '#000000',
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Isometric dot background */}
              <IsometricDotBackground />
              
              {/* Tower Content */}
              <div className="relative h-full p-6" style={{ zIndex: 10 }}>
                <div 
                  className="relative px-6 py-4 border-2 bg-black/80 backdrop-blur-sm mb-6"
                  style={{
                    borderColor: '#22c55e',
                    borderRadius: '12px',
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.1)'
                  }}
                >
                  {/* Corner decorations */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                  
                  <motion.div
                    className="text-xl font-bold text-center text-green-400"
                    style={{
                      textShadow: '0 0 20px #22c55e, 0 0 40px #22c55e',
                      fontFamily: 'monospace'
                    }}
                    animate={{
                      textShadow: [
                        '0 0 20px #22c55e, 0 0 40px #22c55e',
                        '0 0 30px #22c55e, 0 0 60px #22c55e',
                        '0 0 20px #22c55e, 0 0 40px #22c55e'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    TOWERS GAME
                  </motion.div>
                </div>
                
                {/* Enhanced Tower */}
                <div className="space-y-3">
                  {/* Render levels from top (8) to bottom (1) - visual tower layout */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const displayLevel = 8 - i; // Display level (8 to 1) - top to bottom visually
                    const gameLevel = displayLevel - 1; // Game level index (7 to 0)
                    const isCurrentLevel = gameState?.currentLevel === gameLevel;
                    const isCompletedLevel = gameState?.currentLevel > gameLevel;
                    
                    // Debug logging
                    if (displayLevel === 1) {
                      console.log(`Bottom Level - Display: ${displayLevel}, Game: ${gameLevel}, Current: ${gameState?.currentLevel}, Active: ${isCurrentLevel}`);
                    }
                    
                    return (
                      <motion.div 
                        key={displayLevel} 
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold"
                          style={{
                            borderColor: isCurrentLevel ? '#22c55e' : '#475569',
                            backgroundColor: isCurrentLevel ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 0, 0, 0.6)',
                            color: isCurrentLevel ? '#22c55e' : '#94a3b8',
                            boxShadow: isCurrentLevel ? '0 0 15px rgba(34, 197, 94, 0.5)' : 'none'
                          }}
                        >
                          {displayLevel}
                        </div>
                        <div className="flex gap-2 flex-1">
                          {Array.from({ length: gameState?.blocksPerLevel || settings.blocks }, (_, blockIndex) => {
                            
                            return (
                              <motion.button
                                key={blockIndex}
                                onClick={() => isCurrentLevel && isPlaying && selectBlock(blockIndex)}
                                disabled={!isCurrentLevel || !isPlaying}
                                className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all relative overflow-hidden`}
                                style={{
                                  borderColor: isCurrentLevel && isPlaying 
                                    ? '#22c55e' 
                                    : '#475569',
                                  backgroundColor: isCompletedLevel
                                    ? 'rgba(34, 197, 94, 0.1)'
                                    : 'rgba(0, 0, 0, 0.6)',
                                  boxShadow: isCurrentLevel && isPlaying
                                    ? '0 0 15px rgba(34, 197, 94, 0.3)'
                                    : 'none'
                                }}
                                whileHover={isCurrentLevel && isPlaying ? {
                                  scale: 1.05,
                                  boxShadow: '0 0 25px rgba(34, 197, 94, 0.8)'
                                } : {}}
                                whileTap={isCurrentLevel && isPlaying ? { scale: 0.95 } : {}}
                                transition={{ duration: 0.3 }}
                              >
                                {/* Hover indicator for current level */}
                                {isCurrentLevel && isPlaying && (
                                  <motion.div
                                    className="absolute inset-0 bg-green-400/10 rounded-lg"
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'towers' }} />
    </div>
  );
};

export default Towers;