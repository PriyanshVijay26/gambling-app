import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';
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
          <pattern id="limboIsometricDots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle 
              cx={spacing/2} 
              cy={spacing/2} 
              r={dotSize/2} 
              fill="rgba(255,255,255,0.1)" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#limboIsometricDots)" />
        
        {/* Additional isometric grid lines */}
        <defs>
          <pattern id="limboIsometricGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 20 L 20 0 L 40 20 L 20 40 Z" 
              fill="none" 
              stroke="rgba(0,245,255,0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#limboIsometricGrid)" />
      </svg>
    </div>
  );
};

const Limbo = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { socket, connected } = useSocket();

  const playGame = () => {
    if (!socket || !connected) return;
    setIsPlaying(true);
    socket.emit('limbo:play', { betAmount, targetMultiplier });
  };

  useEffect(() => {
    if (!socket) return;
    
    const onResult = (gameResult) => {
      setResult(gameResult);
      setFair(gameResult.fair);
      setIsPlaying(false);
    };

    socket.on('limbo:result', onResult);
    return () => socket.off('limbo:result', onResult);
  }, [socket]);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">📈 Limbo</h1>
          <p className="text-gray-400 text-lg">Aim for the highest multiplier before the limit</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Visualization */}
          <div className="lg:col-span-2">
            <div 
              className="relative rounded-xl border-2 border-slate-600 overflow-hidden"
              style={{ 
                height: '400px',
                background: '#000000',
                boxShadow: '0 0 40px rgba(0, 245, 255, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Isometric dot background */}
              <IsometricDotBackground />
              
              {/* Game content */}
              <div className="relative h-full p-6 flex items-center justify-center" style={{ zIndex: 10 }}>
                {/* Multiplier display in styled box */}
                <motion.div 
                  className="relative"
                  animate={{ 
                    scale: isPlaying ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: isPlaying ? Infinity : 0 
                  }}
                >
                  {/* Styled container box */}
                  <div 
                    className="relative px-8 py-6 border-2 bg-black/80 backdrop-blur-sm"
                    style={{
                      borderColor: result 
                        ? (result.won ? '#00ff88' : '#ff4444') 
                        : isPlaying 
                        ? '#00f5ff' 
                        : '#666666',
                      borderRadius: '12px',
                      boxShadow: result 
                        ? (result.won 
                          ? '0 0 30px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.1)'
                          : '0 0 30px rgba(255, 68, 68, 0.5), inset 0 0 20px rgba(255, 68, 68, 0.1)')
                        : isPlaying 
                        ? '0 0 30px rgba(0, 245, 255, 0.5), inset 0 0 20px rgba(0, 245, 255, 0.1)'
                        : '0 0 20px rgba(102, 102, 102, 0.3)'
                    }}
                  >
                    {/* Corner decorations */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                    
                    {/* Multiplier text */}
                    <motion.div
                      className={`text-5xl font-bold mb-2 text-center ${
                        result 
                          ? (result.won ? 'text-green-400' : 'text-red-400')
                          : 'text-white'
                      }`}
                      style={{
                        textShadow: result
                          ? (result.won 
                            ? '0 0 20px #00ff88, 0 0 40px #00ff88'
                            : '0 0 20px #ff4444, 0 0 40px #ff4444')
                          : isPlaying 
                          ? '0 0 20px #00ff88, 0 0 40px #00ff88' 
                          : '0 0 20px #ffffff',
                        fontFamily: 'monospace'
                      }}
                      animate={isPlaying ? {
                        textShadow: [
                          '0 0 20px #00ff88, 0 0 40px #00ff88',
                          '0 0 30px #00ff88, 0 0 60px #00ff88',
                          '0 0 20px #00ff88, 0 0 40px #00ff88'
                        ]
                      } : {}}
                      transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                    >
                      {isPlaying ? '...' : result ? `${result.actualMultiplier.toFixed(2)}x` : `${targetMultiplier.toFixed(2)}x`}
                    </motion.div>
                    
                    {/* Status text */}
                    <div className={`text-center text-sm font-semibold uppercase tracking-wider ${
                      result 
                        ? (result.won ? 'text-green-300' : 'text-red-300')
                        : 'text-cyan-400'
                    }`}>
                      {isPlaying ? 'ROLLING...' : 
                       result ? (result.won ? `WON AT ${result.actualMultiplier.toFixed(2)}X!` : `LOST! TARGET: ${targetMultiplier.toFixed(2)}X`) : 
                       'SET TARGET & PLAY'}
                    </div>
                    
                    {/* Animated border glow */}
                    {isPlaying && (
                      <motion.div
                        className="absolute inset-0 border-2 rounded-xl"
                        style={{ borderColor: '#00f5ff' }}
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
                <label className="block text-gray-400 text-sm font-medium mb-2">Bet Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-3 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Target Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <motion.button
                onClick={playGame}
                disabled={isPlaying || !connected}
                className="w-full btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isPlaying ? '🎲 Rolling...' : '🎯 Play Limbo'}
              </motion.button>

              {result && (
                <motion.div 
                  className="p-4 bg-slate-700/50 rounded-lg"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`text-lg font-bold mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                    {result.won ? `🎉 You Won $${result.winnings.toFixed(2)}!` : `💸 You Lost $${betAmount.toFixed(2)}`}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Multiplier: {result.actualMultiplier.toFixed(2)}x • Target: {result.targetMultiplier.toFixed(2)}x
                  </div>
                  {fair && (
                    <button onClick={() => setVerifyOpen(true)} className="text-sm text-blue-400 hover:text-blue-300">
                      Verify Fairness
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={() => setVerifyOpen(false)} fair={fair} game={{ type: 'limbo' }} />
    </div>
  );
};

export default Limbo;