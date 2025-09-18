import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';

export const useAutoBet = (gameType, onGameResult = null) => {
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [autoBetConfig, setAutoBetConfig] = useState(null);
  const [currentBetAmount, setCurrentBetAmount] = useState(0);
  const [autoBetStats, setAutoBetStats] = useState({
    totalBets: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    currentStreak: 0
  });
  
  const { socket } = useSocket();
  const { info, warning, error } = useNotification();
  const autoBetRef = useRef(null);
  const timeoutRef = useRef(null);

  // Auto-bet game logic
  const executeAutoBet = useCallback(async (betAmount, gameParams = {}) => {
    if (!socket || !isAutoBetting) return;

    try {
      // Emit the appropriate game event based on game type
      switch (gameType) {
        case 'mines':
          socket.emit('mines:start', { betAmount, ...gameParams });
          break;
        case 'coinflip':
          socket.emit('coinflip:play', { betAmount, ...gameParams });
          break;
        case 'crash':
          socket.emit('crash:join', { betAmount, ...gameParams });
          break;
        case 'dice':
          socket.emit('dice:play', { betAmount, ...gameParams });
          break;
        case 'plinko':
          socket.emit('plinko:play', { betAmount, ...gameParams });
          break;
        case 'limbo':
          socket.emit('limbo:play', { betAmount, ...gameParams });
          break;
        case 'towers':
          socket.emit('towers:start', { betAmount, ...gameParams });
          break;
        case 'upgrader':
          socket.emit('upgrader:play', { betAmount, ...gameParams });
          break;
        default:
          console.warn(`Auto-bet not implemented for game type: ${gameType}`);
          return;
      }
    } catch (err) {
      console.error('Auto-bet execution error:', err);
      stopAutoBet('Execution error');
    }
  }, [socket, isAutoBetting, gameType]);

  // Handle game results
  const handleGameResult = useCallback((result) => {
    if (!isAutoBetting) return;

    const isWin = result.won || result.win;
    const payout = result.winnings || result.payout || 0;
    const betAmount = result.betAmount || currentBetAmount;

    // Update statistics
    const newStats = {
      ...autoBetStats,
      totalBets: autoBetStats.totalBets + 1,
      wins: isWin ? autoBetStats.wins + 1 : autoBetStats.wins,
      losses: isWin ? autoBetStats.losses : autoBetStats.losses + 1,
      profit: autoBetStats.profit + (isWin ? payout - betAmount : -betAmount),
      currentStreak: isWin 
        ? (autoBetStats.currentStreak > 0 ? autoBetStats.currentStreak + 1 : 1)
        : (autoBetStats.currentStreak < 0 ? autoBetStats.currentStreak - 1 : -1)
    };

    setAutoBetStats(newStats);

    // Call external result handler
    if (onGameResult) {
      onGameResult(result, newStats);
    }

    // Check stop conditions
    if (autoBetConfig) {
      // Stop on win target
      if (autoBetConfig.stopOnWin && isWin && payout >= autoBetConfig.winTarget) {
        stopAutoBet('Win target reached');
        return;
      }

      // Stop on loss limit
      if (autoBetConfig.stopOnLoss && newStats.profit <= -autoBetConfig.lossLimit) {
        stopAutoBet('Loss limit reached');
        return;
      }

      // Stop on bet count
      if (newStats.totalBets >= autoBetConfig.numberOfBets) {
        stopAutoBet('Bet limit reached');
        return;
      }

      // Calculate next bet amount using strategy
      const nextBetAmount = calculateNextBet(betAmount, isWin, autoBetConfig);
      setCurrentBetAmount(nextBetAmount);

      // Schedule next bet
      const delay = autoBetConfig.betDelay || 1000; // 1 second default delay
      timeoutRef.current = setTimeout(() => {
        if (isAutoBetting) {
          executeAutoBet(nextBetAmount, autoBetConfig.gameParams);
        }
      }, delay);
    }
  }, [isAutoBetting, autoBetConfig, currentBetAmount, autoBetStats, onGameResult, executeAutoBet]);

  // Calculate next bet amount based on strategy
  const calculateNextBet = (currentBet, won, config) => {
    const { strategy, baseBet, maxBet, onWin, onLoss, winMultiplier, lossMultiplier } = config;

    let nextBet = currentBet;

    switch (strategy) {
      case 'martingale':
        nextBet = won ? baseBet : Math.min(currentBet * 2, maxBet);
        break;
      case 'reverse-martingale':
        nextBet = won ? Math.min(currentBet * 2, maxBet) : baseBet;
        break;
      case 'fibonacci':
        // Simplified Fibonacci - would need more complex state tracking
        nextBet = won ? baseBet : Math.min(currentBet * 1.618, maxBet);
        break;
      case 'dalembert':
        nextBet = won 
          ? Math.max(currentBet - baseBet, baseBet)
          : Math.min(currentBet + baseBet, maxBet);
        break;
      case 'custom':
        if (won) {
          switch (onWin) {
            case 'increase':
              nextBet = Math.min(currentBet * winMultiplier, maxBet);
              break;
            case 'decrease':
              nextBet = Math.max(currentBet / winMultiplier, baseBet);
              break;
            default:
              nextBet = baseBet;
          }
        } else {
          switch (onLoss) {
            case 'increase':
              nextBet = Math.min(currentBet * lossMultiplier, maxBet);
              break;
            case 'decrease':
              nextBet = Math.max(currentBet / lossMultiplier, baseBet);
              break;
            default:
              nextBet = baseBet;
          }
        }
        break;
      default:
        nextBet = baseBet;
    }

    return Math.max(Math.min(nextBet, maxBet), baseBet);
  };

  // Start auto-betting
  const startAutoBet = useCallback((config) => {
    if (!socket) {
      error('Not connected to server');
      return false;
    }

    if (isAutoBetting) {
      warning('Auto-bet is already running');
      return false;
    }

    setIsAutoBetting(true);
    setAutoBetConfig(config);
    setCurrentBetAmount(config.baseBet);
    setAutoBetStats({
      totalBets: 0,
      wins: 0,
      losses: 0,
      profit: 0,
      currentStreak: 0
    });

    info('Auto-bet started');

    // Start first bet
    setTimeout(() => {
      executeAutoBet(config.baseBet, config.gameParams);
    }, 100);

    return true;
  }, [socket, isAutoBetting, executeAutoBet, error, warning, info]);

  // Stop auto-betting
  const stopAutoBet = useCallback((reason = 'Stopped by user') => {
    setIsAutoBetting(false);
    setAutoBetConfig(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    info(`Auto-bet stopped: ${reason}`);
  }, [info]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    const eventMap = {
      'mines': ['mines:result'],
      'coinflip': ['coinflip:result'],
      'crash': ['crash:result'],
      'dice': ['dice:result'],
      'plinko': ['plinko:result'],
      'limbo': ['limbo:result'],
      'towers': ['towers:result'],
      'upgrader': ['upgrader:result']
    };

    const events = eventMap[gameType] || [];

    events.forEach(event => {
      socket.on(event, handleGameResult);
    });

    return () => {
      events.forEach(event => {
        socket.off(event, handleGameResult);
      });
    };
  }, [socket, gameType, handleGameResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAutoBetting,
    autoBetConfig,
    currentBetAmount,
    autoBetStats,
    startAutoBet,
    stopAutoBet,
    handleGameResult
  };
};

export default useAutoBet;