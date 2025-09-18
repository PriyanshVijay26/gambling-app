import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, DollarSign } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

// Particle component for space effects
const Particle = ({ x, y, delay }) => (
  <motion.div
    className="particle"
    initial={{ x, y, opacity: 0, scale: 0 }}
    animate={{ 
      x: x + Math.random() * 200 - 100,
      y: y - Math.random() * 300 - 100,
      opacity: [0, 1, 0],
      scale: [0, 1, 0]
    }}
    transition={{ 
      duration: 2,
      delay,
      ease: "easeOut"
    }}
    style={{
      position: 'absolute',
      width: '4px',
      height: '4px',
      backgroundColor: '#00f5ff',
      borderRadius: '50%',
      boxShadow: '0 0 10px #00f5ff',
      pointerEvents: 'none',
      zIndex: 10
    }}
  />
);

// Rocket component
const Rocket = ({ multiplier, crashed, gameActive }) => {
  const rocketY = Math.max(20, 300 - (multiplier - 1) * 80);
  const rocketX = 50 + (multiplier - 1) * 25;
  
  return (
    <motion.div
      className="rocket"
      animate={{
        x: rocketX,
        y: rocketY,
        rotate: crashed ? 180 : -15,
        scale: crashed ? 0.5 : gameActive ? 1.2 : 1
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      style={{
        position: 'absolute',
        fontSize: '30px',
        zIndex: 15,
        filter: crashed ? 'hue-rotate(180deg) brightness(0.5)' : 'drop-shadow(0 0 15px #ff6b35)'
      }}
    >
      🚀
    </motion.div>
  );
};

// Dynamic curve component
const CurveVisualization = ({ multiplierHistory, currentMultiplier, crashed }) => {
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 30;
  
  const points = multiplierHistory.map((mult, index) => {
    const x = padding + (index / Math.max(multiplierHistory.length - 1, 1)) * (svgWidth - 2 * padding);
    const y = svgHeight - padding - Math.min((mult - 1) * 60, svgHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="relative">
      <svg 
        width={svgWidth} 
        height={svgHeight} 
        className="curve-visualization"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          zIndex: 5,
          background: 'transparent'
        }}
      >
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ff6b35" stopOpacity="0.9" />
            <stop offset="100%" stopColor={crashed ? "#ff1744" : "#00ff88"} stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[1, 2, 3, 4, 5].map(mult => (
          <line
            key={mult}
            x1={padding}
            y1={svgHeight - padding - (mult - 1) * 40}
            x2={svgWidth - padding}
            y2={svgHeight - padding - (mult - 1) * 40}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}
        
        {multiplierHistory.length > 1 && (
          <motion.polyline
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="2"
            points={points}
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              filter: 'drop-shadow(0 0 8px #00f5ff)',
              opacity: 0.7
            }}
          />
        )}
      </svg>
    </div>
  );
};

// Isometric dot pattern background
const IsometricDotBackground = () => {
  const dotSize = 2;
  const spacing = 20;
  const rows = 20;
  const cols = 30;
  
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      <svg 
        width="100%" 
        height="100%" 
        className="absolute inset-0"
        style={{ background: '#000000' }}
      >
        <defs>
          <pattern id="isometricDots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle 
              cx={spacing/2} 
              cy={spacing/2} 
              r={dotSize/2} 
              fill="rgba(255,255,255,0.1)" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#isometricDots)" />
        
        {/* Additional isometric grid lines */}
        <defs>
          <pattern id="isometricGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 20 L 20 0 L 40 20 L 20 40 Z" 
              fill="none" 
              stroke="rgba(0,245,255,0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#isometricGrid)" />
      </svg>
    </div>
  );
};

const Crash = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [cashedOut, setCashedOut] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [multiplierHistory, setMultiplierHistory] = useState([1.00]);
  const [particles, setParticles] = useState([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const { socket, connected } = useSocket();

  const startGame = () => {
    if (!socket || !connected) return;
    socket.emit('crash:join', { betAmount });
    setMultiplierHistory([1.00]);
    setParticles([]);
  };

  const cashOut = () => {
    if (!socket || !connected || !gameState) return;
    socket.emit('crash:cashOut', { gameId: gameState.gameId });
  };

  useEffect(() => {
    if (!socket) return;

    const onGameJoined = (state) => {
      setGameState(state);
      setCashedOut(false);
      setCrashed(false);
      setCurrentMultiplier(1.00);
      setShowExplosion(false);
    };

    const onMultiplierUpdate = (data) => {
      setCurrentMultiplier(data.multiplier);
      setMultiplierHistory(prev => [...prev.slice(-30), data.multiplier]);
      
      // Add trail particles during flight
      if (Math.random() < 0.4) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: 50 + (data.multiplier - 1) * 25,
          y: Math.max(20, 300 - (data.multiplier - 1) * 80),
          delay: 0
        };
        setParticles(prev => [...prev.slice(-8), newParticle]);
      }
    };

    const onGameCrashed = (result) => {
      setCrashed(true);
      setGameState(null);
      setFair(result.fair);
      setShowExplosion(true);
      
      // Create explosion particles
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: Date.now() + i,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 50,
        delay: Math.random() * 0.3
      }));
      setParticles(newParticles);
      
      setTimeout(() => {
        setShowExplosion(false);
        setParticles([]);
      }, 2000);
    };

    const onCashedOut = (result) => {
      setCashedOut(true);
      setGameState(null);
      setFair(result.fair);
    };

    socket.on('crash:joined', onGameJoined);
    socket.on('crash:multiplier', onMultiplierUpdate);
    socket.on('crash:crashed', onGameCrashed);
    socket.on('crash:cashedOut', onCashedOut);

    return () => {
      socket.off('crash:joined', onGameJoined);
      socket.off('crash:multiplier', onMultiplierUpdate);
      socket.off('crash:crashed', onGameCrashed);
      socket.off('crash:cashedOut', onCashedOut);
    };
  }, [socket]);

  const resetGame = () => {
    setGameState(null);
    setCashedOut(false);
    setCrashed(false);
    setCurrentMultiplier(1.00);
    setFair(null);
    setMultiplierHistory([1.00]);
    setParticles([]);
    setShowExplosion(false);
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🚀 Crash Game</h1>
          <p className="text-gray-400 text-lg">Cash out before the rocket crashes!</p>
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
              
              {/* Game area */}
              <div className="relative h-full p-6">
                {/* Curve visualization - subtle overlay */}
                <div className="absolute inset-0" style={{ zIndex: 3 }}>
                  <CurveVisualization 
                    multiplierHistory={multiplierHistory} 
                    currentMultiplier={currentMultiplier}
                    crashed={crashed}
                  />
                </div>
                
                {/* Rocket */}
                <Rocket 
                  multiplier={currentMultiplier} 
                  crashed={crashed}
                  gameActive={!!gameState}
                />
                
                {/* Particles */}
                <AnimatePresence>
                  {particles.map(particle => (
                    <Particle
                      key={particle.id}
                      x={particle.x}
                      y={particle.y}
                      delay={particle.delay}
                    />
                  ))}
                </AnimatePresence>
                
                {/* Explosion effect */}
                <AnimatePresence>
                  {showExplosion && (
                    <motion.div
                      className="explosion"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2 }}
                      style={{
                        position: 'absolute',
                        top: '150px',
                        left: '150px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #ff6b35, #ff1744, transparent)',
                        pointerEvents: 'none',
                        zIndex: 20
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Multiplier display in styled box */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div 
                    className="relative"
                    animate={{ 
                      scale: gameState ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: gameState ? Infinity : 0 
                    }}
                  >
                    {/* Styled container box */}
                    <div 
                      className="relative px-8 py-6 border-2 bg-black/80 backdrop-blur-sm"
                      style={{
                        borderColor: crashed ? '#ff4444' : cashedOut ? '#00ff88' : gameState ? '#00f5ff' : '#666666',
                        borderRadius: '12px',
                        boxShadow: crashed 
                          ? '0 0 30px rgba(255, 68, 68, 0.5), inset 0 0 20px rgba(255, 68, 68, 0.1)'
                          : cashedOut 
                          ? '0 0 30px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.1)'
                          : gameState 
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
                          crashed ? 'text-red-400' : cashedOut ? 'text-green-400' : 'text-white'
                        }`}
                        style={{
                          textShadow: gameState 
                            ? '0 0 20px #00ff88, 0 0 40px #00ff88' 
                            : crashed 
                            ? '0 0 20px #ff4444, 0 0 40px #ff4444'
                            : cashedOut
                            ? '0 0 20px #00ff88, 0 0 40px #00ff88'
                            : '0 0 20px #ffffff',
                          fontFamily: 'monospace'
                        }}
                        animate={gameState ? {
                          textShadow: [
                            '0 0 20px #00ff88, 0 0 40px #00ff88',
                            '0 0 30px #00ff88, 0 0 60px #00ff88',
                            '0 0 20px #00ff88, 0 0 40px #00ff88'
                          ]
                        } : {}}
                        transition={{ duration: 1, repeat: gameState ? Infinity : 0 }}
                      >
                        {crashed ? 'CRASH!' : cashedOut ? 'WIN!' : `${currentMultiplier.toFixed(2)}x`}
                      </motion.div>
                      
                      {/* Status text */}
                      <div className={`text-center text-sm font-semibold uppercase tracking-wider ${
                        crashed ? 'text-red-300' : cashedOut ? 'text-green-300' : 'text-cyan-400'
                      }`}>
                        {gameState ? 'FLYING...' : 
                         crashed ? 'CRASHED!' : 
                         cashedOut ? `WON AT ${currentMultiplier.toFixed(2)}X!` : 
                         'READY TO LAUNCH'}
                      </div>
                      
                      {/* Animated border glow */}
                      {gameState && (
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
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Bet Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      disabled={gameState}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-3 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Multiplier</span>
                    <span className="text-yellow-400 font-bold">{currentMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential Win</span>
                    <span className="text-green-400 font-bold">${(betAmount * currentMultiplier).toFixed(2)}</span>
                  </div>
                </div>

                {!gameState && !cashedOut && !crashed && (
                  <motion.button 
                    onClick={startGame} 
                    disabled={!connected}
                    className="w-full btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🚀 Launch Rocket
                  </motion.button>
                )}

                {gameState && !cashedOut && !crashed && (
                  <motion.button 
                    onClick={cashOut}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ 
                      boxShadow: ['0 0 20px rgba(34, 197, 94, 0.5)', '0 0 30px rgba(34, 197, 94, 0.8)', '0 0 20px rgba(34, 197, 94, 0.5)']
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Cash Out ${(betAmount * currentMultiplier).toFixed(2)}
                  </motion.button>
                )}

                {(cashedOut || crashed) && (
                  <div className="space-y-3">
                    <motion.div 
                      className="p-4 bg-slate-700/50 rounded-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`text-lg font-bold mb-2 ${cashedOut ? 'text-green-400' : 'text-red-400'}`}>
                        {cashedOut 
                          ? `🎉 Cashed Out: $${(betAmount * currentMultiplier).toFixed(2)}!`
                          : `💥 Crashed! Lost $${betAmount.toFixed(2)}`
                        }
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        Final Multiplier: {currentMultiplier.toFixed(2)}x
                      </div>
                      {fair && (
                        <button onClick={() => setVerifyOpen(true)} className="text-sm text-blue-400 hover:text-blue-300">
                          Verify Fairness
                        </button>
                      )}
                    </motion.div>
                    <motion.button 
                      onClick={resetGame}
                      className="w-full btn-secondary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🔄 New Game
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={() => setVerifyOpen(false)} fair={fair} game={{ type: 'crash' }} />
    </div>
  );
};

export default Crash;