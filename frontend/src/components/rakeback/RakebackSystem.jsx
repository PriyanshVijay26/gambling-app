import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RakebackSystem = ({ user, socket }) => {
  const [rakebackData, setRakebackData] = useState({
    totalRaked: 0,
    totalReturned: 0,
    availableRakeback: 0,
    rakebackRate: 0.05, // 5% default
    weeklyRaked: 0,
    monthlyRaked: 0,
    history: []
  });
  const [claiming, setClaiming] = useState(false);
  const [timeframe, setTimeframe] = useState('weekly');

  useEffect(() => {
    if (socket) {
      // Listen for rakeback updates
      socket.on('rakebackUpdate', (data) => {
        setRakebackData(prev => ({
          ...prev,
          ...data
        }));
      });

      socket.on('rakebackClaimed', (data) => {
        setRakebackData(prev => ({
          ...prev,
          availableRakeback: 0,
          totalReturned: prev.totalReturned + data.amount,
          history: [data, ...prev.history]
        }));
        setClaiming(false);
      });

      // Request initial rakeback data
      socket.emit('getRakebackData');

      return () => {
        socket.off('rakebackUpdate');
        socket.off('rakebackClaimed');
      };
    }
  }, [socket]);

  const handleClaimRakeback = () => {
    if (rakebackData.availableRakeback > 0 && !claiming) {
      setClaiming(true);
      socket.emit('claimRakeback');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getRakebackTier = (totalRaked) => {
    if (totalRaked >= 100000) return { tier: 'Diamond', rate: 0.08, color: 'from-blue-400 to-purple-600' };
    if (totalRaked >= 50000) return { tier: 'Platinum', rate: 0.07, color: 'from-gray-300 to-gray-500' };
    if (totalRaked >= 20000) return { tier: 'Gold', rate: 0.06, color: 'from-yellow-400 to-yellow-600' };
    if (totalRaked >= 5000) return { tier: 'Silver', rate: 0.055, color: 'from-gray-400 to-gray-600' };
    return { tier: 'Bronze', rate: 0.05, color: 'from-orange-400 to-red-600' };
  };

  const currentTier = getRakebackTier(rakebackData.totalRaked);

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Rakeback System</h2>
        <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentTier.color}`}>
          <span className="text-white font-bold">{currentTier.tier}</span>
          <span className="text-white ml-2">{(currentTier.rate * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Rakeback Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-700 rounded-lg p-4"
        >
          <div className="text-gray-400 text-sm">Available Rakeback</div>
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(rakebackData.availableRakeback)}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-700 rounded-lg p-4"
        >
          <div className="text-gray-400 text-sm">Total Raked</div>
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(rakebackData.totalRaked)}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-700 rounded-lg p-4"
        >
          <div className="text-gray-400 text-sm">Total Returned</div>
          <div className="text-2xl font-bold text-purple-400">
            {formatCurrency(rakebackData.totalReturned)}
          </div>
        </motion.div>
      </div>

      {/* Claim Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClaimRakeback}
          disabled={rakebackData.availableRakeback <= 0 || claiming}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 ${
            rakebackData.availableRakeback > 0 && !claiming
              ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {claiming ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Claiming...</span>
            </div>
          ) : (
            `Claim ${formatCurrency(rakebackData.availableRakeback)}`
          )}
        </motion.button>
      </div>

      {/* Progress to Next Tier */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Progress to Next Tier</span>
          <span className="text-white font-bold">
            {currentTier.tier === 'Diamond' ? 'Max Tier Reached' : 'Next: Higher Rate'}
          </span>
        </div>
        {currentTier.tier !== 'Diamond' && (
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((rakebackData.totalRaked % 20000) / 200, 100)}%`
              }}
            ></div>
          </div>
        )}
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2">
        {['weekly', 'monthly', 'all-time'].map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeframe === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Rakeback Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Rakeback Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Weekly Raked:</span>
              <span className="text-white">{formatCurrency(rakebackData.weeklyRaked)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Raked:</span>
              <span className="text-white">{formatCurrency(rakebackData.monthlyRaked)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Rate:</span>
              <span className="text-green-400">{(currentTier.rate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Tier Benefits</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Bronze (0+):</span>
              <span className="text-orange-400">5.0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Silver ($5K+):</span>
              <span className="text-gray-400">5.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gold ($20K+):</span>
              <span className="text-yellow-400">6.0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platinum ($50K+):</span>
              <span className="text-gray-300">7.0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Diamond ($100K+):</span>
              <span className="text-blue-400">8.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rakeback History */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">Recent Claims</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {rakebackData.history.slice(0, 10).map((claim, index) => (
              <motion.div
                key={claim.id || index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-between items-center p-2 bg-gray-600 rounded"
              >
                <div>
                  <div className="text-white font-medium">
                    {formatCurrency(claim.amount)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(claim.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-green-400 text-sm">
                  +{formatCurrency(claim.amount)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {rakebackData.history.length === 0 && (
            <div className="text-gray-400 text-center py-4">
              No rakeback claims yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RakebackSystem;
