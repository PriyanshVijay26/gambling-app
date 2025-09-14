import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dice6, DollarSign, RotateCcw } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

const Dice = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [rollOver, setRollOver] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { socket, connected } = useSocket();

  const roll = () => {
    if (!socket || !connected) return;
    setIsRolling(true);
    socket.emit('dice:roll', { betAmount, target, rollOver });
  };

  useEffect(() => {
    if (!socket) return;
    const onResult = (r) => {
      setResult(r);
      setFair(r.fair);
      setIsRolling(false);
    };
    socket.on('dice:result', onResult);
    return () => socket.off('dice:result', onResult);
  }, [socket]);

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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Dice</h1>
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

                <button
                  onClick={roll}
                  disabled={isRolling || !connected}
                  className="w-full btn-primary"
                >
                  {isRolling ? 'Rolling...' : 'Roll Dice'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 text-center">
              <motion.div
                animate={isRolling ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRolling ? Infinity : 0 }}
                className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-white"
              >
                {isRolling ? '?' : (result?.actualRoll?.toFixed(2) || '00.00')}
              </motion.div>
              {result && (
                <>
                  <div className={`text-lg font-bold mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                    {result.won ? `You Won $${result.winnings.toFixed(2)}!` : `You Lost $${betAmount.toFixed(2)}`}
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    Target: {rollOver ? 'Over' : 'Under'} {result.target} • Win Chance: {result.winChance}%
                  </div>
                  {fair && (
                    <button onClick={()=>setVerifyOpen(true)} className="text-sm text-blue-400 hover:text-blue-300">Verify Fairness</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'dice' }} />
    </div>
  );
};

export default Dice;