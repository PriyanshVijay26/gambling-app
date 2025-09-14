import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, DollarSign, ArrowUp, TrendingUp } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

const Towers = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { socket, connected } = useSocket();

  const startGame = () => {
    if (!socket || !connected) return;
    socket.emit('towers:startGame', { betAmount, difficulty });
  };

  const selectBlock = (position) => {
    if (!socket || !connected || !isPlaying) return;
    socket.emit('towers:selectBlock', { position });
  };

  const cashOut = () => {
    if (!socket || !connected || !isPlaying) return;
    socket.emit('towers:cashOut');
  };

  useEffect(() => {
    if (!socket) return;
    
    const onGameState = (state) => {
      setGameState(state);
      setIsPlaying(true);
    };

    const onBlockResult = (result) => {
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

    socket.on('towers:gameState', onGameState);
    socket.on('towers:blockResult', onBlockResult);
    socket.on('towers:cashedOut', onCashedOut);

    return () => {
      socket.off('towers:gameState', onGameState);
      socket.off('towers:blockResult', onBlockResult);
      socket.off('towers:cashedOut', onCashedOut);
    };
  }, [socket]);

  const difficultySettings = {
    easy: { name: 'Easy', blocks: 3, safe: 2 },
    medium: { name: 'Medium', blocks: 4, safe: 2 },
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Towers</h1>
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
                      <span className="text-white">{gameState.level}</span>
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

                {!isPlaying ? (
                  <button
                    onClick={startGame}
                    disabled={!connected}
                    className="w-full btn-primary"
                  >
                    Start Climbing
                  </button>
                ) : (
                  <button
                    onClick={cashOut}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Cash Out ${(betAmount * (gameState?.multiplier || 1)).toFixed(2)}
                  </button>
                )}

                {gameState?.gameOver && (
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className={`text-lg font-bold mb-2 ${gameState.won ? 'text-green-400' : 'text-red-400'}`}>
                      {gameState.won 
                        ? `You Won $${gameState.winnings.toFixed(2)}!` 
                        : `Game Over! You lost $${betAmount.toFixed(2)}`
                      }
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Reached Level: {gameState.level} • Final Multiplier: {gameState.multiplier.toFixed(2)}x
                    </div>
                    {fair && (
                      <button onClick={()=>setVerifyOpen(true)} className="text-sm text-blue-400 hover:text-blue-300">Verify Fairness</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Tower</h3>
              
              <div className="space-y-3">
                {/* Render levels from top (8) to bottom (1) */}
                {Array.from({ length: 8 }, (_, i) => {
                  const level = 8 - i;
                  const isCurrentLevel = gameState?.level === level;
                  const isCompletedLevel = gameState?.level > level;
                  const levelState = gameState?.levels?.[level - 1];
                  
                  return (
                    <div key={level} className="flex items-center gap-2">
                      <div className="w-8 text-center text-sm text-gray-400">{level}</div>
                      <div className="flex gap-2 flex-1">
                        {Array.from({ length: settings.blocks }, (_, blockIndex) => {
                          const isRevealed = levelState?.revealed?.includes(blockIndex);
                          const isSafe = levelState?.safePath?.includes(blockIndex);
                          const isSelected = levelState?.selectedBlock === blockIndex;
                          
                          let blockClass = 'w-12 h-12 rounded-lg border-2 border-slate-600 flex items-center justify-center cursor-pointer transition-all';
                          
                          if (isRevealed) {
                            if (isSafe) {
                              blockClass += ' bg-green-500 border-green-400';
                            } else {
                              blockClass += ' bg-red-500 border-red-400';
                            }
                          } else if (isSelected) {
                            blockClass += ' bg-blue-500 border-blue-400';
                          } else if (isCompletedLevel) {
                            blockClass += ' bg-slate-600 opacity-50';
                          } else if (isCurrentLevel && isPlaying) {
                            blockClass += ' hover:border-primary-500 hover:bg-primary-500/20';
                          } else {
                            blockClass += ' bg-slate-700';
                          }
                          
                          return (
                            <button
                              key={blockIndex}
                              onClick={() => isCurrentLevel && isPlaying && selectBlock(blockIndex)}
                              disabled={!isCurrentLevel || !isPlaying}
                              className={blockClass}
                            >
                              {isRevealed && (
                                isSafe ? (
                                  <ArrowUp className="w-4 h-4 text-white" />
                                ) : (
                                  '💣'
                                )
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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