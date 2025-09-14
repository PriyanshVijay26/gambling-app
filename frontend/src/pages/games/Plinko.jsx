import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Triangle, DollarSign } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';

const Plinko = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState('medium');
  const [isDropping, setIsDropping] = useState(false);
  const [result, setResult] = useState(null);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { socket, connected } = useSocket();

  const drop = () => {
    if (!socket || !connected) return;
    setIsDropping(true);
    socket.emit('plinko:drop', { betAmount, risk });
  };

  useEffect(() => {
    if (!socket) return;
    const onResult = (r) => {
      setResult(r);
      setFair(r.fair);
      setIsDropping(false);
    };
    socket.on('plinko:result', onResult);
    return () => socket.off('plinko:result', onResult);
  }, [socket]);

  // Bucket multipliers for visualization
  const multipliers = {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
  }[risk];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Triangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Plinko</h1>
          <p className="text-gray-400 text-lg">Drop the ball and watch it bounce to riches</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
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
                  <label className="block text-gray-400 text-sm font-medium mb-2">Risk Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setRisk(level)}
                        className={`p-3 rounded-lg border-2 transition-all capitalize ${
                          risk === level ? 'border-primary-500 bg-primary-500/20' : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-white font-semibold">{level}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={drop}
                  disabled={isDropping || !connected}
                  className="w-full btn-primary"
                >
                  {isDropping ? 'Dropping...' : 'Drop Ball'}
                </button>

                {result && (
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className={`text-lg font-bold mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                      {result.won ? `You Won $${result.winnings.toFixed(2)}!` : `You Lost $${betAmount.toFixed(2)}`}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Bucket: {result.bucket} • Multiplier: {result.multiplier}x
                    </div>
                    {fair && (
                      <button onClick={()=>setVerifyOpen(true)} className="text-sm text-blue-400 hover:text-blue-300">Verify Fairness</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Plinko Board</h3>
              
              {/* Simplified Plinko Board */}
              <div className="relative bg-slate-900 rounded-lg p-6 overflow-hidden">
                {/* Pegs */}
                <div className="grid grid-cols-8 gap-4 mb-8">
                  {Array.from({ length: 56 }, (_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const offset = row % 2 === 0 ? 0 : 20;
                    return (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gray-600 rounded-full"
                        style={{ marginLeft: `${offset}px` }}
                      />
                    );
                  })}
                </div>

                {/* Ball */}
                {isDropping && (
                  <motion.div
                    initial={{ x: '50%', y: 0 }}
                    animate={{ y: 300 }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    className="absolute top-4 w-3 h-3 bg-yellow-400 rounded-full z-10"
                  />
                )}

                {/* Buckets */}
                <div className="grid grid-cols-17 gap-1 mt-8">
                  {multipliers.map((mult, i) => (
                    <div
                      key={i}
                      className={`p-2 text-center text-xs rounded ${
                        result && result.bucket === i
                          ? 'bg-yellow-500 text-black font-bold'
                          : mult >= 10
                          ? 'bg-green-600'
                          : mult >= 2
                          ? 'bg-blue-600'
                          : mult >= 1
                          ? 'bg-slate-600'
                          : 'bg-red-600'
                      }`}
                    >
                      {mult}x
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-400">
                Current Risk: <span className="capitalize text-white font-semibold">{risk}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'plinko' }} />
    </div>
  );
};

export default Plinko;