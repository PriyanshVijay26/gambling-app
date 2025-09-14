import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, DollarSign, ArrowUp, TrendingUp } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Upgrader</h1>
          <p className="text-gray-400 text-lg">Upgrade your items with increasing multipliers</p>
        </motion.div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Initial Bet</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    disabled={gameState && !gameOver}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50"
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
                  <button
                    onClick={startGame}
                    disabled={!connected}
                    className="w-full btn-primary"
                  >
                    Start Game
                  </button>
                )}

                {gameState && !gameOver && gameState.currentLevel < 10 && (
                  <button
                    onClick={tryUpgrade}
                    disabled={isUpgrading}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    {isUpgrading ? 'Upgrading...' : `Upgrade (${upgradeChances[gameState?.currentLevel || 1]}%)`}
                  </button>
                )}

                {gameState && !gameOver && gameState.currentLevel > 1 && (
                  <button 
                    onClick={cashOut} 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Cash Out ${getCurrentValue().toFixed(2)}
                  </button>
                )}

                {gameOver && (
                  <div className="space-y-3">
                    <button 
                      onClick={startGame} 
                      className="w-full btn-secondary"
                    >
                      New Game
                    </button>
                    {fair && (
                      <button 
                        onClick={() => setVerifyOpen(true)} 
                        className="w-full text-sm text-blue-400 hover:text-blue-300"
                      >
                        Verify Fairness
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold ${
                        i + 1 <= (gameState ? gameState.currentLevel : 1)
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'border-slate-600 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                {gameOver && gameState && (
                  <div className="mb-4">
                    {gameState.won ? (
                      <div className="text-green-400 font-bold text-lg">
                        {gameState.reason === 'cashout' 
                          ? `Cashed Out: $${gameState.winnings.toFixed(2)}!`
                          : `Max Level Reached: $${gameState.winnings.toFixed(2)}!`
                        }
                      </div>
                    ) : (
                      <div className="text-red-400 font-bold text-lg">
                        Upgrade Failed! Lost $${betAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-white">
                  <div className="text-2xl font-bold">
                    Level {gameState ? gameState.currentLevel : 1}
                  </div>
                  <div className="text-sm text-gray-400">
                    {gameState && gameState.currentLevel < 10 
                      ? `Next: ${upgradeChances[gameState?.currentLevel || 1]}% chance` 
                      : gameState && gameState.currentLevel === 10
                      ? 'Max Level!'
                      : 'Ready to start'
                    }
                  </div>
                </div>
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
