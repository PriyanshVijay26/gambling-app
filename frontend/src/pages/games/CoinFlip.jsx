import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, DollarSign, RotateCcw } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import FairVerifyModal from '../../components/FairVerifyModal';
import AutoBetPanel from '../../components/auto-bet/AutoBetPanel';
import { useAutoBet } from '../../hooks/useAutoBet';

const CoinFlip = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedSide, setSelectedSide] = useState('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [fair, setFair] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [showAutoBet, setShowAutoBet] = useState(false);
  const { socket, connected } = useSocket();
  
  const {
    isAutoBetting,
    autoBetStats,
    startAutoBet,
    stopAutoBet,
    handleGameResult
  } = useAutoBet('coinflip', (result, stats) => {
    console.log('Auto-bet result:', result, stats);
  });

  const flipCoin = () => {
    if (!socket || !connected || isAutoBetting) return;
    setIsFlipping(true);
    socket.emit('coinflip:play', { betAmount, selectedSide });
  };

  useEffect(() => {
    if (!socket) return;
    const onRes = (r) => {
      setResult(r);
      setFair(r.fair);
      setIsFlipping(false);
      
      // Handle auto-bet result
      if (isAutoBetting) {
        handleGameResult(r);
      }
    };
    socket.on('coinflip:result', onRes);
    return () => socket.off('coinflip:result', onRes);
  }, [socket, isAutoBetting, handleGameResult]);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Coin Flip</h1>
          <p className="text-gray-400 text-lg">Simple heads or tails betting</p>
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
                  <label className="block text-gray-400 text-sm font-medium mb-2">Choose Side</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedSide('heads')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSide === 'heads' 
                          ? 'border-primary-500 bg-primary-500/20' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-white font-semibold">Heads</div>
                    </button>
                    <button
                      onClick={() => setSelectedSide('tails')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSide === 'tails' 
                          ? 'border-primary-500 bg-primary-500/20' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-white font-semibold">Tails</div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={flipCoin}
                    disabled={isFlipping || isAutoBetting}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFlipping ? 'Flipping...' : 'Flip Coin'}
                  </button>
                  
                  <button
                    onClick={() => setShowAutoBet(!showAutoBet)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      showAutoBet
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 text-center">
              <motion.div
                animate={isFlipping ? { rotateY: 360 } : {}}
                transition={{ duration: 1.2, repeat: isFlipping ? Infinity : 0 }}
                className={`w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-white ${
                  isAutoBetting ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                }`}
              >
                {isFlipping ? '?' : (result?.result || selectedSide).charAt(0).toUpperCase()}
              </motion.div>
              {result && (
                <>
                  <div className={`text-lg font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                    {result.won ? `You Won $${(result.winnings).toFixed(2)}!` : `You Lost $${betAmount.toFixed(2)}`}
                  </div>
                  {isAutoBetting && (
                    <div className="mt-2 text-sm text-blue-400">
                      Auto-bet: {autoBetStats.totalBets} bets | Profit: ${autoBetStats.profit.toFixed(2)}
                    </div>
                  )}
                  {fair && (
                    <button onClick={()=>setVerifyOpen(true)} className="mt-3 text-sm text-blue-400 hover:text-blue-300">Verify Fairness</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Auto-bet Panel */}
        {showAutoBet && (
          <div className="mt-8">
            <AutoBetPanel
              game="coinflip"
              isGameActive={isFlipping}
              onAutoBetStart={(config, betAmount) => {
                const autoBetConfig = {
                  ...config,
                  gameParams: {
                    selectedSide,
                    betAmount
                  }
                };
                startAutoBet(autoBetConfig);
              }}
              onAutoBetStop={stopAutoBet}
            />
          </div>
        )}
      </div>
      <FairVerifyModal open={verifyOpen} onClose={()=>setVerifyOpen(false)} fair={fair} game={{ type: 'coinflip' }} />
    </div>
  );
};

export default CoinFlip;
