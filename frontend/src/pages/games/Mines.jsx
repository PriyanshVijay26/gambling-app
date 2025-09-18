import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bomb, 
  Diamond, 
  DollarSign, 
  RotateCcw,
  Play,
  Square,
  Coins
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

const Mines = () => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [gridSize, setGridSize] = useState(5);
  const [grid, setGrid] = useState(Array(25).fill('hidden')); // hidden, revealed, mine
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [revealed, setRevealed] = useState(0);
  const [gameId, setGameId] = useState(null);
  const { socket, connected } = useSocket();
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const pendingRevealRef = useRef(null);
  const [coinAnimations, setCoinAnimations] = useState([]);

  useEffect(() => {
    setGrid(Array(gridSize * gridSize).fill('hidden'));
  }, [gridSize]);

  useEffect(() => {
    if (socket && connected) {
      console.log('🔌 Setting up Mines game event listeners...');
      
      const onGameState = (data) => {
        console.log('🎮 Received game state:', data);
        setGameState(data.state);
        setGrid(data.grid);
        setCurrentMultiplier(data.multiplier);
        setRevealed(data.revealed);
        setGameId(data.gameId);
        if (data.fair) setFair(data.fair);
        if (data.gridSize) setGridSize(data.gridSize);
        
        // Process pending reveal if there was one
        if (pendingRevealRef.current !== null && data.gameId) {
          console.log('📡 Processing pending reveal:', pendingRevealRef.current);
          socket.emit('mines:revealCell', {
            gameId: data.gameId,
            cellIndex: pendingRevealRef.current
          });
          pendingRevealRef.current = null;
        }
      };

      const onCellRevealed = (data) => {
        console.log('📍 Received cell revealed:', data);
        
        // Trigger coin animation for successful reveals
        if (!data.mine && !data.gameOver) {
          triggerCoinAnimation();
        }
        
        setGrid(data.grid);
        setCurrentMultiplier(data.multiplier);
        setRevealed(data.revealed);
        if (data.gameOver) {
          setGameState('finished');
          if (data.mine) {
            console.log('💣 Mine hit! Game over.');
          } else {
            console.log('🎉 Game won!');
          }
        }
      };

      const onCashedOut = (data) => {
        console.log('💰 Cash out successful:', data);
        setGameState('finished');
      };

      const onError = (error) => {
        console.error('❌ Game error:', error);
        alert(error.message || 'An error occurred');
      };

      // Register event listeners
      socket.on('mines:gameState', onGameState);
      socket.on('mines:cellRevealed', onCellRevealed);
      socket.on('mines:cashedOut', onCashedOut);
      socket.on('error', onError);

      return () => {
        console.log('🧹 Cleaning up Mines event listeners...');
        socket.off('mines:gameState', onGameState);
        socket.off('mines:cellRevealed', onCellRevealed);
        socket.off('mines:cashedOut', onCashedOut);
        socket.off('error', onError);
      };
    }
  }, [socket, connected]);

  const startGame = () => {
    console.log('🎮 Starting Mines game:', { betAmount, mineCount, gridSize, connected });
    if (socket && connected) {
      socket.emit('mines:startGame', {
        betAmount,
        mineCount,
        gridSize
      });
    } else {
      console.error('❌ Cannot start game - socket not connected:', { socket: !!socket, connected });
      alert('Not connected to server. Please refresh the page.');
    }
  };

  const revealCell = (index) => {
    console.log('📍 Revealing cell:', { index, gameState, socket: !!socket, connected });
    if (!socket || !connected) {
      alert('Not connected to server. Please refresh the page.');
      return;
    }

    if (gameState !== 'playing') {
      // Auto-start and queue the first click
      if (gameState === 'waiting') {
        console.log('🚀 Auto-starting game and queuing cell', index);
        pendingRevealRef.current = index;
        startGame();
      }
      return;
    }

    if (grid[index] === 'hidden' && gameId) {
      console.log('📡 Emitting revealCell event:', { gameId, cellIndex: index });
      socket.emit('mines:revealCell', {
        gameId,
        cellIndex: index
      });
    }
  };

  const cashOut = () => {
    console.log('💰 Attempting to cash out...');
    if (socket && connected && gameState === 'playing' && gameId) {
      socket.emit('mines:cashOut', { gameId });
    } else {
      console.error('❌ Cannot cash out:', { socket: !!socket, connected, gameState, gameId });
      alert('Cannot cash out at this time.');
    }
  };

  const triggerCoinAnimation = () => {
    const animationId = Date.now() + Math.random();
    setCoinAnimations(prev => [...prev, animationId]);
    
    // Remove animation after 2 seconds
    setTimeout(() => {
      setCoinAnimations(prev => prev.filter(id => id !== animationId));
    }, 2000);
  };

  const resetGame = () => {
    setGameState('waiting');
    setGrid(Array(gridSize * gridSize).fill('hidden'));
    setCurrentMultiplier(1.00);
    setRevealed(0);
    setGameId(null);
  };

  const getCellIcon = (cellState, index) => {
    switch (cellState) {
      case 'revealed':
        return <Diamond className="w-6 h-6 text-blue-400" />;
      case 'mine':
        return <Bomb className="w-6 h-6 text-red-400" />;
      default:
        return <Square className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCellStyle = (cellState) => {
    switch (cellState) {
      case 'revealed':
        return 'bg-green-500 border-green-400 hover:bg-green-400';
      case 'mine':
        return 'bg-red-500 border-red-400';
      default:
        return 'bg-slate-700 border-slate-600 hover:bg-slate-600 cursor-pointer';
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <Bomb className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Mines
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Navigate through the minefield and cash out before hitting a bomb
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Bet Settings */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Game Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Grid Size ({gridSize}x{gridSize})
                  </label>
                  <input
                    type="range"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    disabled={gameState === 'playing'}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    min="3"
                    max="8"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>3x3</span>
                    <span>8x8</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Bet Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      disabled={gameState === 'playing'}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Number of Mines ({mineCount})
                  </label>
                  <input
                    type="range"
                    value={mineCount}
                    onChange={(e) => setMineCount(Number(e.target.value))}
                    disabled={gameState === 'playing'}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    min="1"
                    max={Math.min(24, gridSize * gridSize - 1)}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>{Math.min(24, gridSize * gridSize - 1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Current Game</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Multiplier</span>
                  <span className="text-green-400 font-bold">{currentMultiplier.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revealed</span>
                  <span className="text-white">{revealed}/{gridSize * gridSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Potential Win</span>
                  <span className="text-yellow-400 font-bold">
                    ${(betAmount * currentMultiplier).toFixed(2)}
                  </span>
                </div>
                {fair && gameState !== 'playing' && (
                  <button onClick={()=>setVerifyOpen(true)} className="w-full text-sm text-blue-400 hover:text-blue-300 mt-2">Verify Fairness</button>
                )}
              </div>
            </div>

            {/* Game Controls */}
            <div className="space-y-3">
              {gameState === 'waiting' && (
                <button
                  onClick={startGame}
                  disabled={!connected}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </button>
              )}

              {gameState === 'playing' && (
                <button
                  onClick={cashOut}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Cash Out ${(betAmount * currentMultiplier).toFixed(2)}
                </button>
              )}

              {gameState === 'finished' && (
                <button
                  onClick={resetGame}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Game
                </button>
              )}
            </div>
          </motion.div>

          {/* Game Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <div className={`grid gap-3 max-w-md mx-auto`} style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                {grid.map((cellState, index) => (
                  <motion.button
                    key={index}
                    onClick={() => revealCell(index)}
                    disabled={gameState === 'playing' && cellState !== 'hidden'}
                    className={`aspect-square border-2 rounded-lg transition-all duration-200 flex items-center justify-center relative ${getCellStyle(cellState)}`}
                    whileHover={cellState === 'hidden' && (gameState === 'playing' || gameState === 'waiting') ? { scale: 1.05 } : {}}
                    whileTap={cellState === 'hidden' && (gameState === 'playing' || gameState === 'waiting') ? { scale: 0.95 } : {}}
                  >
                    {getCellIcon(cellState, index)}
                  </motion.button>
                ))}
              </div>
              
              {/* Coin Pop Animations */}
              <AnimatePresence>
                {coinAnimations.map((animationId) => (
                  <CoinPopAnimation key={animationId} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400">
            <div>
              <h4 className="text-white font-semibold mb-2">1. Set Your Bet</h4>
              <p>Choose your bet amount and number of mines to hide in the grid.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">2. Reveal Tiles</h4>
              <p>Click tiles to reveal them. Each safe tile increases your multiplier.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">3. Cash Out</h4>
              <p>Cash out anytime to secure your winnings, or risk it all for higher multipliers.</p>
            </div>
          </div>
        </motion.div>

        <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'mines', mineCount, gridSize }} />
      </div>
    </div>
  );
};

// Coin Pop Animation Component
const CoinPopAnimation = () => {
  const coins = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10, // Random x position between 10% and 90%
    delay: i * 0.1,
    rotation: Math.random() * 360,
    size: Math.random() * 0.5 + 0.8
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          className="absolute text-yellow-400"
          style={{
            left: `${coin.x}%`,
            top: '50%',
            fontSize: `${coin.size}rem`
          }}
          initial={{ 
            y: 0,
            x: 0,
            rotate: 0,
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            y: [-20, -80, -120],
            x: [0, (Math.random() - 0.5) * 60],
            rotate: coin.rotation,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            delay: coin.delay,
            ease: "easeOut"
          }}
        >
          <Coins className="w-6 h-6 drop-shadow-lg" />
        </motion.div>
      ))}
      
      {/* Success text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div
          className="text-lg font-bold text-green-400 bg-black bg-opacity-50 px-3 py-1 rounded-lg"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        >
          +${Math.floor(Math.random() * 20 + 5)}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Mines;