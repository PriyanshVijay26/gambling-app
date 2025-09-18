const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database in production)
const rakebackData = new Map();
const rakebackHistory = new Map();

// Initialize rakeback data for a user
const initializeRakeback = (userId) => {
  if (!rakebackData.has(userId)) {
    rakebackData.set(userId, {
      totalRaked: 0,
      totalReturned: 0,
      availableRakeback: 0,
      rakebackRate: 0.05, // 5% default
      weeklyRaked: 0,
      monthlyRaked: 0,
      lastClaimDate: null
    });
  }
  if (!rakebackHistory.has(userId)) {
    rakebackHistory.set(userId, []);
  }
};

// Calculate rakeback tier based on total raked amount
const getRakebackTier = (totalRaked) => {
  if (totalRaked >= 100000) return { tier: 'Diamond', rate: 0.08 };
  if (totalRaked >= 50000) return { tier: 'Platinum', rate: 0.07 };
  if (totalRaked >= 20000) return { tier: 'Gold', rate: 0.06 };
  if (totalRaked >= 5000) return { tier: 'Silver', rate: 0.055 };
  return { tier: 'Bronze', rate: 0.05 };
};

// Update rakeback when a game is played
const updateRakeback = (userId, gameAmount, houseEdge = 0.01) => {
  initializeRakeback(userId);
  
  const rakeAmount = gameAmount * houseEdge;
  const userData = rakebackData.get(userId);
  const currentTier = getRakebackTier(userData.totalRaked + rakeAmount);
  
  userData.totalRaked += rakeAmount;
  userData.weeklyRaked += rakeAmount;
  userData.monthlyRaked += rakeAmount;
  userData.availableRakeback += rakeAmount * currentTier.rate;
  userData.rakebackRate = currentTier.rate;
  
  rakebackData.set(userId, userData);
  
  return {
    rakeAmount,
    newRakeback: rakeAmount * currentTier.rate,
    totalAvailable: userData.availableRakeback
  };
};

// Socket events for rakeback system
const setupRakebackSockets = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.userId || socket.id;
    
    socket.on('getRakebackData', () => {
      initializeRakeback(userId);
      const userData = rakebackData.get(userId);
      const history = rakebackHistory.get(userId);
      
      socket.emit('rakebackUpdate', {
        ...userData,
        history: history.slice(0, 20) // Last 20 transactions
      });
    });
    
    socket.on('claimRakeback', () => {
      initializeRakeback(userId);
      const userData = rakebackData.get(userId);
      
      if (userData.availableRakeback <= 0) {
        socket.emit('rakebackClaimed', { success: false, message: 'No rakeback available' });
        return;
      }
      
      const claimAmount = userData.availableRakeback;
      const claimData = {
        id: Date.now().toString(),
        amount: claimAmount,
        timestamp: Date.now(),
        type: 'rakeback_claim'
      };
      
      // Add to history
      const history = rakebackHistory.get(userId);
      history.unshift(claimData);
      rakebackHistory.set(userId, history);
      
      // Update user data
      userData.availableRakeback = 0;
      userData.totalReturned += claimAmount;
      userData.lastClaimDate = Date.now();
      rakebackData.set(userId, userData);
      
      // Credit user balance (this would integrate with your wallet system)
      socket.emit('balanceUpdate', { 
        balance: claimAmount, 
        source: 'rakeback' 
      });
      
      socket.emit('rakebackClaimed', { 
        success: true, 
        ...claimData 
      });
      
      // Update rakeback data
      socket.emit('rakebackUpdate', {
        ...userData,
        history: history.slice(0, 20)
      });
    });
    
    // Handle game completion to update rakeback
    socket.on('gameCompleted', (gameData) => {
      if (gameData.betAmount && gameData.betAmount > 0) {
        const rakebackUpdate = updateRakeback(userId, gameData.betAmount);
        
        socket.emit('rakebackUpdate', {
          ...rakebackData.get(userId),
          history: rakebackHistory.get(userId).slice(0, 20)
        });
      }
    });
  });
};

// REST API endpoints
router.get('/data/:userId', (req, res) => {
  const { userId } = req.params;
  initializeRakeback(userId);
  
  const userData = rakebackData.get(userId);
  const history = rakebackHistory.get(userId);
  
  res.json({
    ...userData,
    history: history.slice(0, 20),
    tier: getRakebackTier(userData.totalRaked)
  });
});

router.post('/claim/:userId', (req, res) => {
  const { userId } = req.params;
  initializeRakeback(userId);
  
  const userData = rakebackData.get(userId);
  
  if (userData.availableRakeback <= 0) {
    return res.status(400).json({ success: false, message: 'No rakeback available' });
  }
  
  const claimAmount = userData.availableRakeback;
  const claimData = {
    id: Date.now().toString(),
    amount: claimAmount,
    timestamp: Date.now(),
    type: 'rakeback_claim'
  };
  
  // Add to history
  const history = rakebackHistory.get(userId);
  history.unshift(claimData);
  rakebackHistory.set(userId, history);
  
  // Update user data
  userData.availableRakeback = 0;
  userData.totalReturned += claimAmount;
  userData.lastClaimDate = Date.now();
  rakebackData.set(userId, userData);
  
  res.json({
    success: true,
    ...claimData,
    newBalance: claimAmount // This would be the user's new total balance
  });
});

router.post('/update/:userId', (req, res) => {
  const { userId } = req.params;
  const { gameAmount, houseEdge } = req.body;
  
  const rakebackUpdate = updateRakeback(userId, gameAmount, houseEdge);
  
  res.json({
    success: true,
    ...rakebackUpdate,
    userData: rakebackData.get(userId)
  });
});

// Scheduled task to reset weekly/monthly counters (would use cron in production)
const resetPeriodCounters = () => {
  const now = new Date();
  const isNewWeek = now.getDay() === 1 && now.getHours() === 0; // Monday at midnight
  const isNewMonth = now.getDate() === 1 && now.getHours() === 0; // 1st of month at midnight
  
  if (isNewWeek || isNewMonth) {
    for (const [userId, userData] of rakebackData.entries()) {
      if (isNewWeek) userData.weeklyRaked = 0;
      if (isNewMonth) userData.monthlyRaked = 0;
      rakebackData.set(userId, userData);
    }
  }
};

// Export functions for use in other modules
module.exports = {
  router,
  setupRakebackSockets,
  updateRakeback,
  getRakebackTier,
  resetPeriodCounters
};