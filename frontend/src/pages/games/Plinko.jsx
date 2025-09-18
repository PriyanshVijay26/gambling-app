import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, DollarSign } from 'lucide-react';
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
          <pattern id="plinkoIsometricDots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle 
              cx={spacing/2} 
              cy={spacing/2} 
              r={dotSize/2} 
              fill="rgba(255,255,255,0.1)" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#plinkoIsometricDots)" />
        
        {/* Additional isometric grid lines */}
        <defs>
          <pattern id="plinkoIsometricGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 20 L 20 0 L 40 20 L 20 40 Z" 
              fill="none" 
              stroke="rgba(168, 85, 247, 0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#plinkoIsometricGrid)" />
      </svg>
    </div>
  );
};

const Plinko = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState('medium');
  const [isDropping, setIsDropping] = useState(false);
  const [result, setResult] = useState(null);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 });
  const [droppingAnimation, setDroppingAnimation] = useState(null);
  const { socket, connected } = useSocket();

  const drop = () => {
    if (!socket || !connected || isDropping) return;
    
    setIsDropping(true);
    setResult(null);
    setBallPosition({ x: 50, y: 0 });
    
    // Start ball dropping animation
    const animationId = setTimeout(() => {
      // Simulate random ball path
      const path = [];
      let currentX = 50;
      
      for (let row = 0; row < 8; row++) {
        currentX += (Math.random() - 0.5) * 15; // Random horizontal movement
        currentX = Math.max(10, Math.min(90, currentX)); // Keep within bounds
        path.push({ x: currentX, y: (row + 1) * 12 });
      }
      
      setDroppingAnimation(path);
    }, 100);
    
    socket.emit('plinko:drop', { betAmount, risk });
  };

  useEffect(() => {
    if (!socket) return;
    const onResult = (r) => {
      // Delay result display to let animation complete
      setTimeout(() => {
        setResult(r);
        setFair(r.fair);
        setIsDropping(false);
        setDroppingAnimation(null);
      }, 1500); // Wait for ball animation
    };
    socket.on('plinko:result', onResult);
    return () => socket.off('plinko:result', onResult);
  }, [socket]);

  // Bucket multipliers for visualization - MUST match backend exactly
  const multipliers = {
    low: [1000, 130, 26, 9, 4, 2, 1.5, 1, 0.5, 1, 1.5, 2, 4, 9, 26, 130, 1000],
    medium: [1000, 120, 18, 8, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 8, 18, 120, 1000],
    high: [1000, 43, 7, 3, 1.5, 1, 0.5, 0.3, 0.2, 0.3, 0.5, 1, 1.5, 3, 7, 43, 1000]
  }[risk];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Triangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🔺 Plinko</h1>
          <p className="text-gray-400 text-lg">Drop the ball and watch it bounce to riches</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Place Your Bet</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Bet Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Risk Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setRisk(level)}
                        className={`p-3 rounded-lg border-2 transition-all capitalize ${
                          risk === level ? 'border-primary-500 bg-primary-500/20' : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-white font-semibold">{level}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={drop}
                  disabled={isDropping || !connected}
                  className={`w-full btn-primary ${isDropping ? 'opacity-75 cursor-not-allowed' : ''}`}
                  whileHover={!isDropping ? { scale: 1.02 } : {}}
                  whileTap={!isDropping ? { scale: 0.98 } : {}}
                  animate={isDropping ? {
                    boxShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                      '0 0 40px rgba(168, 85, 247, 0.8)',
                      '0 0 20px rgba(168, 85, 247, 0.5)'
                    ]
                  } : {}}
                  transition={{ duration: 0.5, repeat: isDropping ? Infinity : 0 }}
                >
                  {isDropping ? (
                    <motion.span
                      className="flex items-center justify-center"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      🔺 Dropping... 
                    </motion.span>
                  ) : (
                    '🔺 Drop Ball'
                  )}
                </motion.button>

                {result && (
                  <motion.div 
                    className="p-4 bg-slate-700/50 rounded-lg border"
                    style={{
                      borderColor: result.won ? '#22c55e' : '#ef4444',
                      background: result.won ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <motion.div 
                      className={`text-lg font-bold mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      {result.won ? `🎉 You Won $${result.winnings.toFixed(2)}!` : `😭 You Lost $${betAmount.toFixed(2)}`}
                    </motion.div>
                    <motion.div 
                      className="text-sm text-gray-400 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Bucket: {result.bucket} • Multiplier: {result.multiplier}x • Risk: {result.risk}
                    </motion.div>
                    {fair && (
                      <motion.button 
                        onClick={()=>setVerifyOpen(true)} 
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
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

          <div className="lg:col-span-2">
            <div 
              className="relative rounded-xl border-2 border-slate-600 overflow-hidden"
              style={{ 
                height: '500px',
                background: '#000000',
                boxShadow: '0 0 40px rgba(168, 85, 247, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Isometric dot background */}
              <IsometricDotBackground />
              
              {/* Plinko Board Content */}
              <div className="relative h-full p-6" style={{ zIndex: 10 }}>
                <div 
                  className="relative px-6 py-4 border-2 bg-black/80 backdrop-blur-sm mb-4"
                  style={{
                    borderColor: '#a855f7',
                    borderRadius: '12px',
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.1)'
                  }}
                >
                  {/* Corner decorations */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                  
                  <motion.div
                    className="text-xl font-bold text-center text-purple-400"
                    style={{
                      textShadow: '0 0 20px #a855f7, 0 0 40px #a855f7',
                      fontFamily: 'monospace'
                    }}
                    animate={{
                      textShadow: [
                        '0 0 20px #a855f7, 0 0 40px #a855f7',
                        '0 0 30px #a855f7, 0 0 60px #a855f7',
                        '0 0 20px #a855f7, 0 0 40px #a855f7'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    PLINKO BOARD
                  </motion.div>
                </div>
                
                {/* Enhanced Plinko Board */}
                <div className="relative bg-black/60 rounded-lg p-4 overflow-hidden border border-purple-500/30">
                  {/* Pegs with better positioning */}
                  <div className="relative mb-6">
                    {Array.from({ length: 8 }, (_, row) => (
                      <div key={row} className="flex justify-center mb-4" style={{ marginTop: row * 8 }}>
                        {Array.from({ length: row + 3 }, (_, col) => (
                          <motion.div
                            key={`${row}-${col}`}
                            className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-3 shadow-lg"
                            style={{
                              boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)'
                            }}
                            animate={{
                              boxShadow: [
                                '0 0 10px rgba(168, 85, 247, 0.6)',
                                '0 0 20px rgba(168, 85, 247, 0.8)',
                                '0 0 10px rgba(168, 85, 247, 0.6)'
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: (row + col) * 0.1 }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Animated Ball */}
                  <AnimatePresence>
                    {isDropping && (
                      <motion.div
                        initial={{ x: '50%', y: -20, scale: 0 }}
                        animate={{ 
                          y: 280,
                          scale: [0, 1.2, 1],
                          x: droppingAnimation ? droppingAnimation.map(pos => `${pos.x}%`) : '50%'
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          duration: 2.5, 
                          ease: 'easeInOut',
                          scale: { duration: 0.3 }
                        }}
                        className="absolute top-4 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full z-20"
                        style={{
                          boxShadow: '0 0 15px rgba(251, 191, 36, 0.8), 0 0 30px rgba(251, 191, 36, 0.4)',
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Enhanced Buckets */}
                  <div className="flex justify-between items-end mt-4 gap-0.5 px-1">
                    {multipliers.map((mult, i) => (
                      <motion.div
                        key={i}
                        className={`flex-1 p-1 text-center text-xs rounded border min-w-0 ${
                          result && result.bucket === i
                            ? 'bg-yellow-500 text-black font-bold border-yellow-400 shadow-lg'
                            : mult >= 100
                            ? 'bg-gradient-to-b from-green-500 to-green-700 text-white border-green-400'
                            : mult >= 10
                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-emerald-400'
                            : mult >= 2
                            ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-400'
                            : mult >= 1
                            ? 'bg-gradient-to-b from-slate-500 to-slate-700 text-white border-slate-400'
                            : 'bg-gradient-to-b from-red-500 to-red-700 text-white border-red-400'
                        }`}
                        style={{
                          fontSize: mult >= 100 ? '10px' : '11px',
                          lineHeight: '1.2',
                          padding: '4px 2px'
                        }}
                        animate={result && result.bucket === i ? {
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            '0 0 10px rgba(251, 191, 36, 0.5)',
                            '0 0 25px rgba(251, 191, 36, 0.8)',
                            '0 0 10px rgba(251, 191, 36, 0.5)'
                          ]
                        } : {}}
                        transition={{ duration: 0.5, repeat: result && result.bucket === i ? 2 : 0 }}
                      >
                        {mult}x
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-400">
                    Current Risk: <span className={`capitalize font-semibold ${
                      risk === 'low' ? 'text-green-400' : 
                      risk === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{risk}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'plinko' }} />
    </div>
  );
};

export default Plinko;