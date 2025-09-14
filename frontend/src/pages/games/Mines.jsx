import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bomb, 
  Diamond, 
  DollarSign, 
  RotateCcw,
  Play,
  Square
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

const Mines = () => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [grid, setGrid] = useState(Array(25).fill('hidden')); // hidden, revealed, mine
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [revealed, setRevealed] = useState(0);
  const [gameId, setGameId] = useState(null);
  const { socket, connected } = useSocket();
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);

  useEffect(() => {
    if (socket && connected) {
      socket.on('mines:gameState', (data) => {
        setGameState(data.state);
        setGrid(data.grid);
        setCurrentMultiplier(data.multiplier);
        setRevealed(data.revealed);
        setGameId(data.gameId);
        if (data.fair) setFair(data.fair);
      });

      socket.on('mines:cellRevealed', (data) => {
        setGrid(data.grid);
        setCurrentMultiplier(data.multiplier);
        setRevealed(data.revealed);
        
        if (data.mine) {
          setGameState('finished');
        }
      });

      return () => {
        socket.off('mines:gameState');
        socket.off('mines:cellRevealed');
      };
    }
  }, [socket, connected]);

  const startGame = () => {
    if (socket && connected) {
      socket.emit('mines:startGame', {
        betAmount,
        mineCount
      });
    }
  };

  const revealCell = (index) => {
    if (gameState === 'playing' && grid[index] === 'hidden') {
      socket.emit('mines:revealCell', {
        gameId,
        cellIndex: index
      });
    }
  };

  const cashOut = () => {
    if (socket && connected && gameState === 'playing') {
      socket.emit('mines:cashOut', { gameId });
      setGameState('finished');
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setGrid(Array(25).fill('hidden'));
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
                    max="24"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>24</span>
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
                  <span className="text-white">{revealed}/25</span>
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
              <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                {grid.map((cellState, index) => (
                  <motion.button
                    key={index}
                    onClick={() => revealCell(index)}
                    disabled={gameState !== 'playing' || cellState !== 'hidden'}
                    className={`aspect-square border-2 rounded-lg transition-all duration-200 flex items-center justify-center ${getCellStyle(cellState)}`}
                    whileHover={cellState === 'hidden' && gameState === 'playing' ? { scale: 1.05 } : {}}
                    whileTap={cellState === 'hidden' && gameState === 'playing' ? { scale: 0.95 } : {}}
                  >
                    {getCellIcon(cellState, index)}
                  </motion.button>
                ))}
              </div>
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
            <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'mines', mineCount }} />
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
      </div>
    </div>
  );
};

export default Mines;
