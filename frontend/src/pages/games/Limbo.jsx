import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Limbo</h1>
          <p className="text-gray-400 text-lg">Aim for the highest multiplier before the limit</p>
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none"
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <button
                onClick={playGame}
                disabled={isPlaying || !connected}
                className="w-full btn-primary"
              >
                {isPlaying ? 'Playing...' : 'Play'}
              </button>

              {result && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className={`text-lg font-bold mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                    {result.won ? `You Won $${result.winnings.toFixed(2)}!` : `You Lost $${betAmount.toFixed(2)}`}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Multiplier: {result.actualMultiplier.toFixed(2)}x • Target: {result.targetMultiplier.toFixed(2)}x
                  </div>
                  {fair && (
                    <button onClick={() => setVerifyOpen(true)} className="text-sm text-blue-400 hover:text-blue-300">
                      Verify Fairness
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-4">
                  {isPlaying ? '...' : result ? `${result.actualMultiplier.toFixed(2)}x` : `${targetMultiplier.toFixed(2)}x`}
                </div>
                <div className="text-gray-400">
                  {isPlaying ? 'Rolling...' : result ? `Target: ${targetMultiplier.toFixed(2)}x` : 'Set your target and play'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={() => setVerifyOpen(false)} fair={fair} game={{ type: 'limbo' }} />
    </div>
  );
};

export default Limbo;
