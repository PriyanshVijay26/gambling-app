import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';

const AutoBetPanel = ({ game, onAutoBetStart, onAutoBetStop, isGameActive = false }) => {
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [config, setConfig] = useState({
    baseBet: 1.0,
    numberOfBets: 10,
    stopOnWin: false,
    stopOnLoss: false,
    winTarget: 10.0,
    lossLimit: 10.0,
    onWin: 'reset', // 'reset', 'increase', 'decrease'
    onLoss: 'reset', // 'reset', 'increase', 'decrease'
    winMultiplier: 2.0,
    lossMultiplier: 2.0,
    maxBet: 100.0,
    strategy: 'martingale' // 'martingale', 'fibonacci', 'dalembert', 'custom'
  });
  
  const [stats, setStats] = useState({
    totalBets: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    currentStreak: 0,
    bestStreak: 0,
    worstStreak: 0
  });

  const [currentBet, setCurrentBet] = useState(config.baseBet);
  const [fibonacciSequence, setFibonacciSequence] = useState([1, 1]);
  const [fibonacciIndex, setFibonacciIndex] = useState(0);
  
  const { socket } = useSocket();
  const { info, warning, error } = useNotification();

  useEffect(() => {
    setCurrentBet(config.baseBet);
    setStats({
      totalBets: 0,
      wins: 0,
      losses: 0,
      profit: 0,
      currentStreak: 0,
      bestStreak: 0,
      worstStreak: 0
    });
  }, [config.baseBet]);

  const strategies = {
    martingale: {
      name: 'Martingale',
      description: 'Double bet after loss, reset after win',
      onWin: () => config.baseBet,
      onLoss: (bet) => Math.min(bet * 2, config.maxBet)
    },
    fibonacci: {
      name: 'Fibonacci',
      description: 'Follow Fibonacci sequence on losses',
      onWin: () => {
        setFibonacciIndex(Math.max(0, fibonacciIndex - 2));
        return config.baseBet;
      },
      onLoss: (bet) => {
        const newIndex = Math.min(fibonacciIndex + 1, fibonacciSequence.length - 1);
        if (newIndex >= fibonacciSequence.length - 1) {
          const newSeq = [...fibonacciSequence];
          newSeq.push(newSeq[newSeq.length - 1] + newSeq[newSeq.length - 2]);
          setFibonacciSequence(newSeq);
        }
        setFibonacciIndex(newIndex);
        return Math.min(config.baseBet * fibonacciSequence[newIndex], config.maxBet);
      }
    },
    dalembert: {
      name: "D'Alembert",
      description: 'Increase by base bet on loss, decrease on win',
      onWin: (bet) => Math.max(config.baseBet, bet - config.baseBet),
      onLoss: (bet) => Math.min(bet + config.baseBet, config.maxBet)
    },
    custom: {
      name: 'Custom',
      description: 'Use configured multipliers',
      onWin: (bet) => {
        switch (config.onWin) {
          case 'increase': return Math.min(bet * config.winMultiplier, config.maxBet);
          case 'decrease': return Math.max(bet / config.winMultiplier, config.baseBet);
          default: return config.baseBet;
        }
      },
      onLoss: (bet) => {
        switch (config.onLoss) {
          case 'increase': return Math.min(bet * config.lossMultiplier, config.maxBet);
          case 'decrease': return Math.max(bet / config.lossMultiplier, config.baseBet);
          default: return config.baseBet;
        }
      }
    }
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleGameResult = (result) => {
    const isWin = result.won;
    const payout = result.winnings || 0;
    const betAmount = result.betAmount || currentBet;
    
    const newStats = {
      ...stats,
      totalBets: stats.totalBets + 1,
      wins: isWin ? stats.wins + 1 : stats.wins,
      losses: isWin ? stats.losses : stats.losses + 1,
      profit: stats.profit + (isWin ? payout - betAmount : -betAmount),
      currentStreak: isWin ? (stats.currentStreak > 0 ? stats.currentStreak + 1 : 1) : (stats.currentStreak < 0 ? stats.currentStreak - 1 : -1),
    };
    
    newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
    newStats.worstStreak = Math.min(newStats.worstStreak, newStats.currentStreak);
    
    setStats(newStats);

    // Check stop conditions
    if (config.stopOnWin && isWin && payout >= config.winTarget) {
      stopAutoBet('Win target reached');
      return;
    }
    
    if (config.stopOnLoss && newStats.profit <= -config.lossLimit) {
      stopAutoBet('Loss limit reached');
      return;
    }
    
    if (newStats.totalBets >= config.numberOfBets) {
      stopAutoBet('Bet limit reached');
      return;
    }

    // Calculate next bet using strategy
    const strategy = strategies[config.strategy];
    const nextBet = isWin ? strategy.onWin(currentBet) : strategy.onLoss(currentBet);
    setCurrentBet(nextBet);
  };

  const startAutoBet = () => {
    if (isGameActive) {
      warning('Please wait for current game to finish');
      return;
    }
    
    setIsAutoBetting(true);
    setCurrentBet(config.baseBet);
    info('Auto-bet started');
    
    if (onAutoBetStart) {
      onAutoBetStart(config, currentBet);
    }
  };

  const stopAutoBet = (reason = 'Stopped by user') => {
    setIsAutoBetting(false);
    info(`Auto-bet stopped: ${reason}`);
    
    if (onAutoBetStop) {
      onAutoBetStop(reason);
    }
  };

  const resetStats = () => {
    setStats({
      totalBets: 0,
      wins: 0,
      losses: 0,
      profit: 0,
      currentStreak: 0,
      bestStreak: 0,
      worstStreak: 0
    });
  };

  // Expose handleGameResult to parent
  useEffect(() => {
    if (isAutoBetting && window.autobet) {
      window.autobet.handleResult = handleGameResult;
    }
  }, [isAutoBetting, currentBet, stats, config]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">Auto Bet</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {!isAutoBetting ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startAutoBet}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Start
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => stopAutoBet()}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </motion.button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Configuration</h4>
          
          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Base Bet</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={config.baseBet}
                onChange={(e) => updateConfig('baseBet', parseFloat(e.target.value) || 0.01)}
                disabled={isAutoBetting}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-slate-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Number of Bets</label>
              <input
                type="number"
                min="1"
                value={config.numberOfBets}
                onChange={(e) => updateConfig('numberOfBets', parseInt(e.target.value) || 1)}
                disabled={isAutoBetting}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-slate-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Strategy</label>
            <select
              value={config.strategy}
              onChange={(e) => updateConfig('strategy', e.target.value)}
              disabled={isAutoBetting}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-slate-500 focus:outline-none disabled:opacity-50"
            >
              {Object.entries(strategies).map(([key, strategy]) => (
                <option key={key} value={key}>
                  {strategy.name} - {strategy.description}
                </option>
              ))}
            </select>
          </div>

          {/* Stop Conditions */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-300">Stop Conditions</h5>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="stopOnWin"
                checked={config.stopOnWin}
                onChange={(e) => updateConfig('stopOnWin', e.target.checked)}
                disabled={isAutoBetting}
                className="rounded"
              />
              <label htmlFor="stopOnWin" className="text-xs text-gray-400 flex-1">Stop on win target</label>
              <input
                type="number"
                step="0.01"
                value={config.winTarget}
                onChange={(e) => updateConfig('winTarget', parseFloat(e.target.value) || 0)}
                disabled={isAutoBetting || !config.stopOnWin}
                className="w-20 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-white text-xs focus:border-slate-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="stopOnLoss"
                checked={config.stopOnLoss}
                onChange={(e) => updateConfig('stopOnLoss', e.target.checked)}
                disabled={isAutoBetting}
                className="rounded"
              />
              <label htmlFor="stopOnLoss" className="text-xs text-gray-400 flex-1">Stop on loss limit</label>
              <input
                type="number"
                step="0.01"
                value={config.lossLimit}
                onChange={(e) => updateConfig('lossLimit', parseFloat(e.target.value) || 0)}
                disabled={isAutoBetting || !config.stopOnLoss}
                className="w-20 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-white text-xs focus:border-slate-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Statistics</h4>
            <button
              onClick={resetStats}
              disabled={isAutoBetting}
              className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-gray-400">Total Bets</div>
              <div className="text-white font-bold">{stats.totalBets}</div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-gray-400">Win Rate</div>
              <div className="text-white font-bold">
                {stats.totalBets ? ((stats.wins / stats.totalBets) * 100).toFixed(1) : 0}%
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-gray-400">Profit</div>
              <div className={`font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.profit.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-gray-400">Current Bet</div>
              <div className="text-white font-bold">${currentBet.toFixed(2)}</div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-gray-400">Best Streak</div>
              <div className="text-green-400 font-bold">{stats.bestStreak}</div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-gray-400">Worst Streak</div>
              <div className="text-red-400 font-bold">{stats.worstStreak}</div>
            </div>
          </div>

          {/* Current Status */}
          {isAutoBetting && (
            <div className="bg-blue-600/20 border border-blue-600/50 rounded p-2">
              <div className="flex items-center gap-2 text-blue-400 text-xs">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Auto-betting active - Bet #{stats.totalBets + 1}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoBetPanel;