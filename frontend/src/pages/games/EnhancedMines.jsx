import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bomb, 
  Diamond, 
  DollarSign, 
  Settings,
  Volume2,
  VolumeX,
  Trophy,
  Target
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';
import { useAudio } from '../../context/AudioContext';
import { AnimatedButton, AnimatedInput } from '../../components/ui/AnimatedComponents';
import { WinConfetti, SparkleEffect, ShakeEffect, PulseEffect } from '../../components/effects/ParticleEffects';
import { AudioSettings } from '../../context/AudioContext';

const EnhancedMines = () => {
  const { socket, connected } = useSocket();
  const { success, error, win, multiplier } = useNotification();
  const { gameAudio, isEnabled: audioEnabled } = useAudio();
  
  const [gameState, setGameState] = useState('idle'); // idle, playing, finished
  const [grid, setGrid] = useState(Array(25).fill(null));
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [gameId, setGameId] = useState(null);
  const [winAmount, setWinAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeGrid, setShakeGrid] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    currentStreak: 0
  });

  // Calculate multiplier based on revealed tiles
  const calculateMultiplier = useCallback((revealed, mines) => {
    if (revealed === 0) return 1;
    const safeSpots = 25 - mines;
    let mult = 1;
    for (let i = 0; i < revealed; i++) {
      mult *= (safeSpots - i) / (safeSpots - i - mines);
    }
    return mult;
  }, []);

  // Start new game
  const startGame = useCallback(async () => {
    if (!connected || !socket) {
      error('Not connected to server');
      return;
    }

    try {
      gameAudio.betPlaced();
      setGameState('playing');
      setGrid(Array(25).fill(null));
      setRevealedCount(0);
      setCurrentMultiplier(1);
      setWinAmount(0);

      // Emit start game event
      socket.emit('mines:startGame', {
        betAmount: parseFloat(betAmount),
        mineCount: parseInt(mineCount)
      });

      success('Game started! Choose your tiles carefully.');
    } catch (err) {
      error('Failed to start game');
      setGameState('idle');
    }
  }, [connected, socket, betAmount, mineCount, error, success, gameAudio]);

  // Reveal tile
  const revealTile = useCallback(async (index) => {
    if (gameState !== 'playing' || grid[index] !== null) return;

    gameAudio.click();
    
    // Optimistic update
    const newGrid = [...grid];
    newGrid[index] = 'revealing';
    setGrid(newGrid);

    // Emit reveal event
    socket.emit('mines:revealTile', {
      gameId,
      tileIndex: index
    });
  }, [gameState, grid, gameId, socket, gameAudio]);

  // Cash out
  const cashOut = useCallback(async () => {
    if (gameState !== 'playing' || revealedCount === 0) return;

    gameAudio.minesCashout();
    socket.emit('mines:cashOut', { gameId });
  }, [gameState, revealedCount, gameId, socket, gameAudio]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (data) => {
      setGameId(data.gameId);
      setCurrentMultiplier(1);
      success(`Game started with ${data.mineCount} mines!`);
    };

    const handleTileRevealed = (data) => {
      const newGrid = [...grid];
      
      if (data.isMine) {
        // Hit a mine
        newGrid[data.tileIndex] = 'mine';
        setGrid(newGrid);
        setGameState('finished');
        setShakeGrid(true);
        setTimeout(() => setShakeGrid(false), 500);
        
        gameAudio.minesRevealMine();
        error('💣 You hit a mine!', { duration: 5000 });
        
        // Update stats
        setStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          totalLosses: prev.totalLosses + 1,
          currentStreak: 0
        }));
      } else {
        // Safe tile
        newGrid[data.tileIndex] = 'safe';
        setGrid(newGrid);
        
        const newRevealedCount = revealedCount + 1;
        setRevealedCount(newRevealedCount);
        
        const newMultiplier = calculateMultiplier(newRevealedCount, mineCount);
        setCurrentMultiplier(newMultiplier);
        
        gameAudio.minesRevealSafe();
        
        if (newMultiplier > 2) {
          multiplier(newMultiplier.toFixed(2));
        }
      }
    };

    const handleGameWon = (data) => {
      setGameState('finished');
      setWinAmount(data.winAmount);
      setShowConfetti(true);
      
      gameAudio.win(data.winAmount);
      win(`Amazing! You won!`, `$${data.winAmount.toFixed(2)}`, { duration: 8000 });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalWins: prev.totalWins + 1,
        biggestWin: Math.max(prev.biggestWin, data.winAmount),
        currentStreak: prev.currentStreak + 1
      }));
      
      setTimeout(() => setShowConfetti(false), 4000);
    };

    const handleError = (data) => {
      error(data.message || 'Game error occurred');
      setGameState('idle');
    };

    socket.on('mines:gameStarted', handleGameStarted);
    socket.on('mines:tileRevealed', handleTileRevealed);
    socket.on('mines:gameWon', handleGameWon);
    socket.on('mines:error', handleError);

    return () => {
      socket.off('mines:gameStarted', handleGameStarted);
      socket.off('mines:tileRevealed', handleTileRevealed);
      socket.off('mines:gameWon', handleGameWon);
      socket.off('mines:error', handleError);
    };
  }, [socket, grid, revealedCount, mineCount, calculateMultiplier, win, error, multiplier, gameAudio]);

  // Render tile
  const renderTile = (index) => {
    const tile = grid[index];
    const isRevealing = tile === 'revealing';
    
    return (
      <motion.button
        key={index}
        onClick={() => revealTile(index)}
        disabled={gameState !== 'playing' || tile !== null}
        className={`
          aspect-square rounded-lg border-2 transition-all duration-200 relative overflow-hidden
          ${tile === null 
            ? 'bg-slate-700 border-slate-600 hover:border-slate-500 hover:bg-slate-600' 
            : tile === 'safe'
            ? 'bg-green-600 border-green-500'
            : tile === 'mine'
            ? 'bg-red-600 border-red-500'
            : 'bg-slate-600 border-slate-500'
          }
          ${gameState === 'playing' && tile === null ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
        whileHover={gameState === 'playing' && tile === null ? { scale: 1.05 } : {}}
        whileTap={gameState === 'playing' && tile === null ? { scale: 0.95 } : {}}
        animate={isRevealing ? { rotateY: [0, 90, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {tile === 'safe' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <SparkleEffect intensity="high">
                <Diamond className="w-6 h-6 text-white" />
              </SparkleEffect>
            </motion.div>
          )}
          {tile === 'mine' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Bomb className="w-6 h-6 text-white" />
            </motion.div>
          )}
          {isRevealing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <WinConfetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Enhanced Mines</h1>
            <p className="text-slate-400">
              Find the diamonds, avoid the mines! Current streak: {stats.currentStreak}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Bet Settings */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Game Settings</h3>
              
              <div className="space-y-4">
                <AnimatedInput
                  label="Bet Amount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={gameState === 'playing'}
                  min="1"
                  max="10000"
                />
                
                <AnimatedInput
                  label="Number of Mines"
                  type="number"
                  value={mineCount}
                  onChange={(e) => setMineCount(Math.max(1, Math.min(24, parseInt(e.target.value) || 3)))}
                  disabled={gameState === 'playing'}
                  min="1"
                  max="24"
                />
              </div>
            </div>

            {/* Current Game Info */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Current Game</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Multiplier:</span>
                  <PulseEffect color="green" intensity="medium">
                    <span className="text-green-400 font-bold">
                      {currentMultiplier.toFixed(2)}x
                    </span>
                  </PulseEffect>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Potential Win:</span>
                  <span className="text-white font-bold">
                    ${(betAmount * currentMultiplier).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Tiles Revealed:</span>
                  <span className="text-white">{revealedCount}/25</span>
                </div>
              </div>
            </div>

            {/* Game Actions */}
            <div className="space-y-3">
              {gameState === 'idle' && (
                <AnimatedButton
                  variant="success"
                  size="lg"
                  onClick={startGame}
                  disabled={!connected}
                  className="w-full"
                >
                  Start Game
                </AnimatedButton>
              )}
              
              {gameState === 'playing' && revealedCount > 0 && (
                <AnimatedButton
                  variant="warning"
                  size="lg"
                  onClick={cashOut}
                  className="w-full"
                >
                  Cash Out ${(betAmount * currentMultiplier).toFixed(2)}
                </AnimatedButton>
              )}
              
              {gameState === 'finished' && (
                <AnimatedButton
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setGameState('idle');
                    setGrid(Array(25).fill(null));
                    setRevealedCount(0);
                    setCurrentMultiplier(1);
                  }}
                  className="w-full"
                >
                  New Game
                </AnimatedButton>
              )}
            </div>

            {/* Player Stats */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Your Stats
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Games Played:</span>
                  <span className="text-white">{stats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wins:</span>
                  <span className="text-green-400">{stats.totalWins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Losses:</span>
                  <span className="text-red-400">{stats.totalLosses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Win Rate:</span>
                  <span className="text-white">
                    {stats.gamesPlayed > 0 ? ((stats.totalWins / stats.gamesPlayed) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Biggest Win:</span>
                  <span className="text-yellow-400">${stats.biggestWin.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Game Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-3"
          >
            <ShakeEffect active={shakeGrid} intensity="medium">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                  {grid.map((_, index) => renderTile(index))}
                </div>
              </div>
            </ShakeEffect>
          </motion.div>
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full mx-4"
              >
                <AudioSettings />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedMines;