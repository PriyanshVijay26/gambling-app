const { v4: uuidv4 } = require('uuid');

class VIPSystem {
  constructor(dataService) {
    this.dataService = dataService;
    this.vipLevels = {
      0: { name: 'Bronze', minWager: 0, rakeback: 1, monthlyBonus: 5 },
      1: { name: 'Silver', minWager: 1000, rakeback: 2, monthlyBonus: 15 },
      2: { name: 'Gold', minWager: 5000, rakeback: 3, monthlyBonus: 50 },
      3: { name: 'Platinum', minWager: 25000, rakeback: 5, monthlyBonus: 150 },
      4: { name: 'Diamond', minWager: 100000, rakeback: 8, monthlyBonus: 500 }
    };
    
    this.achievements = {
      firstWin: { name: 'First Victory', reward: 5, check: (stats) => stats.wins >= 1 },
      winStreak: { name: 'Hot Streak', reward: 25, check: (stats) => stats.bestStreak >= 5 },
      bigWin: { name: 'Big Winner', reward: 50, check: (stats) => stats.biggestWin >= 100 },
      loyalPlayer: { name: 'Loyal Player', reward: 100, check: (stats) => stats.loginStreak >= 30 },
      highRoller: { name: 'High Roller', reward: 200, check: (stats) => stats.totalWagered >= 10000 }
    };
  }

  // Calculate user's VIP level based on total wagered
  calculateVIPLevel(totalWagered) {
    let level = 0;
    for (let i = 4; i >= 0; i--) {
      if (totalWagered >= this.vipLevels[i].minWager) {
        level = i;
        break;
      }
    }
    return level;
  }

  // Calculate rakeback amount
  calculateRakeback(userId, losses, vipLevel) {
    const rakebackRate = this.vipLevels[vipLevel].rakeback / 100;
    return losses * rakebackRate;
  }

  // Check for level up
  async checkLevelUp(userId, oldLevel, newLevel) {
    if (newLevel > oldLevel) {
      // Award level up bonus
      const bonus = this.vipLevels[newLevel].monthlyBonus;
      await this.dataService.addBalance(userId, bonus);
      
      return {
        leveledUp: true,
        oldLevel,
        newLevel,
        bonus
      };
    }
    return { leveledUp: false };
  }

  // Check achievements
  async checkAchievements(userId, userStats, currentAchievements = []) {
    const newAchievements = [];
    
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (!currentAchievements.includes(key) && achievement.check(userStats)) {
        newAchievements.push({
          id: key,
          name: achievement.name,
          reward: achievement.reward
        });
        
        // Award achievement reward
        await this.dataService.addBalance(userId, achievement.reward);
      }
    }
    
    return newAchievements;
  }

  // Get daily reward for user
  getDailyReward(loginStreak) {
    const dailyRewards = {
      1: { amount: 1, type: 'coins' },
      2: { amount: 2, type: 'coins' },
      3: { amount: 5, type: 'coins' },
      4: { amount: 3, type: 'coins' },
      5: { amount: 10, type: 'coins' },
      6: { amount: 5, type: 'coins' },
      7: { amount: 25, type: 'coins', bonus: true }
    };
    
    const day = ((loginStreak - 1) % 7) + 1;
    return dailyRewards[day] || dailyRewards[1];
  }

  // Process game result for VIP benefits
  async processGameResult(userId, gameResult) {
    try {
      const user = await this.dataService.getUser(userId);
      if (!user) return;

      const oldLevel = this.calculateVIPLevel(user.totalWagered);
      const newTotalWagered = user.totalWagered + gameResult.betAmount;
      const newLevel = this.calculateVIPLevel(newTotalWagered);

      // Check for level up
      const levelUpResult = await this.checkLevelUp(userId, oldLevel, newLevel);

      // Calculate rakeback if user lost
      let rakebackAmount = 0;
      if (!gameResult.won) {
        rakebackAmount = this.calculateRakeback(userId, gameResult.betAmount, newLevel);
        if (rakebackAmount > 0) {
          await this.dataService.addRakeback(userId, rakebackAmount);
        }
      }

      // Check achievements
      const userStats = {
        wins: user.wins || 0,
        losses: user.losses || 0,
        totalWagered: newTotalWagered,
        biggestWin: Math.max(user.biggestWin || 0, gameResult.won ? gameResult.payout : 0),
        bestStreak: user.bestStreak || 0,
        loginStreak: user.loginStreak || 0
      };

      const newAchievements = await this.checkAchievements(
        userId, 
        userStats, 
        user.achievements || []
      );

      return {
        levelUp: levelUpResult,
        rakeback: rakebackAmount,
        achievements: newAchievements,
        newLevel
      };

    } catch (error) {
      console.error('Error processing VIP game result:', error);
      return null;
    }
  }

  // Get user VIP data
  async getUserVIPData(userId) {
    try {
      const user = await this.dataService.getUser(userId);
      if (!user) return null;

      const vipLevel = this.calculateVIPLevel(user.totalWagered || 0);
      const vipInfo = this.vipLevels[vipLevel];

      // Get daily login info
      const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
      const today = new Date();
      const isNewDay = !lastLogin || lastLogin.toDateString() !== today.toDateString();
      
      let dailyReward = null;
      if (isNewDay) {
        const loginStreak = user.loginStreak || 0;
        dailyReward = this.getDailyReward(loginStreak + 1);
      }

      return {
        level: vipLevel,
        levelInfo: vipInfo,
        totalWagered: user.totalWagered || 0,
        currentStreak: user.currentStreak || 0,
        achievements: user.achievements || [],
        dailyRewards: user.dailyRewards || [],
        rakeback: {
          available: user.rakebackAvailable || 0,
          total: user.rakebackTotal || 0
        },
        nextReward: dailyReward,
        canClaimDaily: isNewDay
      };
    } catch (error) {
      console.error('Error getting VIP data:', error);
      return null;
    }
  }

  // Claim daily reward
  async claimDailyReward(userId) {
    try {
      const user = await this.dataService.getUser(userId);
      if (!user) return null;

      const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
      const today = new Date();
      const isNewDay = !lastLogin || lastLogin.toDateString() !== today.toDateString();

      if (!isNewDay) {
        return { success: false, message: 'Already claimed today' };
      }

      const loginStreak = user.loginStreak || 0;
      const newStreak = isNewDay ? loginStreak + 1 : loginStreak;
      const reward = this.getDailyReward(newStreak);

      // Award the reward
      await this.dataService.addBalance(userId, reward.amount);
      
      // Update login streak and last login
      await this.dataService.updateUserLoginStreak(userId, newStreak, today);

      return {
        success: true,
        reward,
        newStreak
      };
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      return { success: false, message: 'Error claiming reward' };
    }
  }

  // Claim rakeback
  async claimRakeback(userId) {
    try {
      const user = await this.dataService.getUser(userId);
      if (!user) return null;

      const available = user.rakebackAvailable || 0;
      if (available <= 0) {
        return { success: false, message: 'No rakeback available' };
      }

      // Transfer rakeback to balance
      await this.dataService.addBalance(userId, available);
      await this.dataService.clearRakeback(userId);

      return {
        success: true,
        amount: available
      };
    } catch (error) {
      console.error('Error claiming rakeback:', error);
      return { success: false, message: 'Error claiming rakeback' };
    }
  }
}

module.exports = VIPSystem;