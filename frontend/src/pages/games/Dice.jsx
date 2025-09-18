import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dice6, DollarSign, RotateCcw } from 'lucide-react';
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
          <pattern id="diceIsometricDots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle 
              cx={spacing/2} 
              cy={spacing/2} 
              r={dotSize/2} 
              fill="rgba(255,255,255,0.1)" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diceIsometricDots)" />
        
        {/* Additional isometric grid lines */}
        <defs>
          <pattern id="diceIsometricGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 20 L 20 0 L 40 20 L 20 40 Z" 
              fill="none" 
              stroke="rgba(59, 130, 246, 0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diceIsometricGrid)" />
      </svg>
    </div>
  );
};

const Dice = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [rollOver, setRollOver] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [currentNumber, setCurrentNumber] = useState('00.00');
  const [rollAnimationId, setRollAnimationId] = useState(null);
  const { socket, connected } = useSocket();

  const roll = () => {
    if (!socket || !connected || isRolling) return;
    
    setIsRolling(true);
    setResult(null);
    
    // Start the rolling animation with random numbers
    let animationFrame = 0;
    const maxFrames = 90; // 3 seconds at 30fps
    
    const animateRoll = () => {
      // Generate random number for animation
      const randomNum = (Math.random() * 100).toFixed(2);
      setCurrentNumber(randomNum);
      
      animationFrame++;
      
      if (animationFrame < maxFrames) {
        const frameId = requestAnimationFrame(animateRoll);
        setRollAnimationId(frameId);
      }
    };
    
    // Start animation
    animateRoll();
    
    // Send the actual roll request
    socket.emit('dice:roll', { betAmount, target, rollOver });
  };

  useEffect(() => {
    if (!socket) return;
    const onResult = (r) => {
      // Stop the rolling animation immediately
      if (rollAnimationId) {
        cancelAnimationFrame(rollAnimationId);
        setRollAnimationId(null);
      }
      
      // First, show the final number without result message
      setCurrentNumber(r.actualRoll.toFixed(2));
      
      // Then after a dramatic pause, show the result
      setTimeout(() => {
        setResult(r);
        setFair(r.fair);
        setIsRolling(false);
      }, 800); // Longer delay for better dramatic effect
    };
    socket.on('dice:result', onResult);
    return () => socket.off('dice:result', onResult);
  }, [socket, rollAnimationId]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (rollAnimationId) {
        cancelAnimationFrame(rollAnimationId);
      }
    };
  }, [rollAnimationId]);

  const winChance = rollOver ? (100 - target) : target;
  const multiplier = 99 / winChance;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Dice6 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🎲 Dice</h1>
          <p className="text-gray-400 text-lg">Roll over or under your target number</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
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
                  <label className="block text-gray-400 text-sm font-medium mb-2">Target ({target})</label>
                  <input
                    type="range"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    min="1"
                    max="99"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>99</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Prediction</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRollOver(false)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        !rollOver ? 'border-primary-500 bg-primary-500/20' : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-white font-semibold">Roll Under {target}</div>
                      <div className="text-sm text-gray-400">{target}% chance</div>
                    </button>
                    <button
                      onClick={() => setRollOver(true)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        rollOver ? 'border-primary-500 bg-primary-500/20' : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-white font-semibold">Roll Over {target}</div>
                      <div className="text-sm text-gray-400">{(100-target)}% chance</div>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Multiplier:</span>
                    <span className="text-white">{multiplier.toFixed(4)}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Payout:</span>
                    <span className="text-green-400">${(betAmount * multiplier).toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  onClick={roll}
                  disabled={isRolling || !connected}
                  className={`w-full btn-primary ${isRolling ? 'opacity-75 cursor-not-allowed' : ''}`}
                  whileHover={!isRolling ? { scale: 1.02 } : {}}
                  whileTap={!isRolling ? { scale: 0.98 } : {}}
                  animate={isRolling ? {
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 40px rgba(59, 130, 246, 0.8)',
                      '0 0 20px rgba(59, 130, 246, 0.5)'
                    ]
                  } : {}}
                  transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
                >
                  {isRolling ? (
                    <motion.span
                      className="flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      🎲 Rolling... 
                    </motion.span>
                  ) : (
                    '🎲 Roll Dice'
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div 
              className="relative rounded-xl border-2 border-slate-600 overflow-hidden"
              style={{ 
                width: '400px',
                height: '400px',
                background: '#000000',
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Isometric dot background */}
              <IsometricDotBackground />
              
              {/* Dice content */}
              <div className="relative h-full p-6 flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
                {/* Rolling particles effect */}
                {isRolling && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full"
                        initial={{
                          x: '50%',
                          y: '50%',
                          opacity: 0,
                          scale: 0
                        }}
                        animate={{
                          x: [200, Math.random() * 400 - 200],
                          y: [200, Math.random() * 400 - 200],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.1,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </div>
                )}
                
                <motion.div
                  animate={{
                    rotate: isRolling ? 360 : 0,
                    scale: isRolling ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    rotate: { duration: 0.5, repeat: isRolling ? Infinity : 0 },
                    scale: { duration: 0.3, repeat: isRolling ? Infinity : 0 }
                  }}
                  className="relative mb-6"
                >
                  <div 
                    className="relative px-8 py-6 border-2 bg-black/80 backdrop-blur-sm flex items-center justify-center"
                    style={{
                      borderColor: isRolling ? '#60a5fa' : (result ? (result.won ? '#22c55e' : '#ef4444') : '#3b82f6'),
                      borderRadius: '12px',
                      boxShadow: isRolling 
                        ? '0 0 50px rgba(96, 165, 250, 0.8), inset 0 0 30px rgba(96, 165, 250, 0.2)'
                        : (result 
                          ? (result.won 
                            ? '0 0 40px rgba(34, 197, 94, 0.8), inset 0 0 20px rgba(34, 197, 94, 0.2)'
                            : '0 0 40px rgba(239, 68, 68, 0.8), inset 0 0 20px rgba(239, 68, 68, 0.2)')
                          : '0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)'),
                      width: '120px',
                      height: '120px',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    {/* Corner decorations */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                    
                    {/* Pulsing ring effect while rolling */}
                    {isRolling && (
                      <motion.div
                        className="absolute inset-0 border-2 rounded-xl"
                        style={{ borderColor: '#60a5fa' }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 0, 0.8]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    <motion.div
                      className="text-3xl font-bold text-center"
                      style={{
                        color: isRolling ? '#60a5fa' : (result ? (result.won ? '#22c55e' : '#ef4444') : '#3b82f6'),
                        textShadow: isRolling 
                          ? '0 0 30px #60a5fa, 0 0 60px #60a5fa'
                          : (result ? (result.won ? '0 0 20px #22c55e, 0 0 40px #22c55e' : '0 0 20px #ef4444, 0 0 40px #ef4444') : '0 0 20px #3b82f6, 0 0 40px #3b82f6'),
                        fontFamily: 'monospace'
                      }}
                      animate={{
                        textShadow: isRolling ? [
                          '0 0 30px #60a5fa, 0 0 60px #60a5fa',
                          '0 0 50px #60a5fa, 0 0 100px #60a5fa',
                          '0 0 30px #60a5fa, 0 0 60px #60a5fa'
                        ] : (result ? [
                          result.won ? '0 0 20px #22c55e, 0 0 40px #22c55e' : '0 0 20px #ef4444, 0 0 40px #ef4444',
                          result.won ? '0 0 30px #22c55e, 0 0 60px #22c55e' : '0 0 30px #ef4444, 0 0 60px #ef4444',
                          result.won ? '0 0 20px #22c55e, 0 0 40px #22c55e' : '0 0 20px #ef4444, 0 0 40px #ef4444'
                        ] : [
                          '0 0 20px #3b82f6, 0 0 40px #3b82f6',
                          '0 0 30px #3b82f6, 0 0 60px #3b82f6',
                          '0 0 20px #3b82f6, 0 0 40px #3b82f6'
                        ]),
                        scale: !isRolling && currentNumber !== '00.00' && !result ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        textShadow: { duration: isRolling ? 0.5 : 2, repeat: Infinity },
                        scale: { duration: 0.6, ease: "easeOut" }
                      }}
                    >
                      {currentNumber}
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Final result indicator */}
                {!isRolling && currentNumber !== '00.00' && !result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-center text-cyan-400 font-semibold uppercase tracking-wider mb-4"
                  >
                    FINAL RESULT
                  </motion.div>
                )}
                
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: 0.3,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 200
                    }}
                    className="text-center"
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
                      className="text-sm text-gray-400 mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Target: {rollOver ? 'Over' : 'Under'} {result.target} • Win Chance: {result.winChance}%
                    </motion.div>
                    {fair && (
                      <motion.button 
                        onClick={()=>setVerifyOpen(true)} 
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
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
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'dice' }} />
    </div>
  );
};

export default Dice;