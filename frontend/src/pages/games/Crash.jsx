import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, DollarSign } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

const Crash = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [cashedOut, setCashedOut] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { socket, connected } = useSocket();

  const startGame = () => {
    if (!socket || !connected) return;
    socket.emit('crash:join', { betAmount });
  };

  const cashOut = () => {
    if (!socket || !connected || !gameState) return;
    socket.emit('crash:cashOut');
  };

  useEffect(() => {
    if (!socket) return;

    const onGameJoined = (state) => {
      setGameState(state);
      setCashedOut(false);
      setCrashed(false);
      setCurrentMultiplier(1.00);
    };

    const onMultiplierUpdate = (data) => {
      setCurrentMultiplier(data.multiplier);
    };

    const onGameCrashed = (result) => {
      setCrashed(true);
      setGameState(null);
      setFair(result.fair);
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
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Crash</h1>
          <p className="text-gray-400 text-lg">Cash out before the multiplier crashes</p>
        </motion.div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Bet Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    disabled={gameState}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50"
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
                <button onClick={startGame} disabled={!connected} className="w-full btn-primary">
                  Join Game
                </button>
              )}

              {gameState && !cashedOut && !crashed && (
                <button onClick={cashOut} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg">
                  Cash Out ${(betAmount * currentMultiplier).toFixed(2)}
                </button>
              )}

              {(cashedOut || crashed) && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className={`text-lg font-bold mb-2 ${cashedOut ? 'text-green-400' : 'text-red-400'}`}>
                      {cashedOut 
                        ? `Cashed Out: $${(betAmount * currentMultiplier).toFixed(2)}!`
                        : `Crashed! Lost $${betAmount.toFixed(2)}`
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
                  </div>
                  <button onClick={resetGame} className="w-full btn-secondary">
                    New Game
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ scale: gameState ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: gameState ? Infinity : 0 }}
                  className={`text-8xl font-bold mb-4 ${
                    crashed ? 'text-red-400' : cashedOut ? 'text-green-400' : 'text-white'
                  }`}
                >
                  {crashed ? 'CRASH!' : `${currentMultiplier.toFixed(2)}x`}
                </motion.div>
                
                <div className="text-gray-400">
                  {gameState ? 'Game in progress...' : crashed ? 'Game crashed!' : cashedOut ? 'Successfully cashed out!' : 'Waiting to start'}
                </div>
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