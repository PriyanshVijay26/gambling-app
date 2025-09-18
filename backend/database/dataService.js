const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class DataService {
  constructor(database) {
    this.db = database;
  }

  // Generate unique referral code
  generateReferralCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // Create a new user with default settings
  async createUser(username, referredBy = null) {
    const userId = uuidv4();
    let referralCode = this.generateReferralCode();
    
    try {
      // Check if referral code already exists and generate a new one if needed
      let codeExists = true;
      let attempts = 0;
      
      while (codeExists && attempts < 10) {
        const existingUser = await this.db.getUserByReferralCode(referralCode);
        if (!existingUser) {
          codeExists = false;
        } else {
          referralCode = this.generateReferralCode();
          attempts++;
        }
      }
      
      if (attempts >= 10) {
        throw new Error('Failed to generate unique referral code');
      }

      const newUser = await this.db.createUser({
        id: userId,
        username,
        referralCode,
        referredBy
      });

      // Create fairness data for user
      await this.createUserFairness(userId);

      return {
        id: userId,
        username,
        balance: 1000.0,
        referralCode,
        referredBy,
        totalWagered: 0,
        totalWon: 0,
        gamesPlayed: 0,
        biggestWin: 0
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user with formatted data
  async getUser(userId) {
    try {
      const user = await this.db.getUserById(userId);
      if (!user) return null;

      return {
        id: user.id,
        username: user.username,
        balance: parseFloat(user.balance),
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        totalWagered: parseFloat(user.total_wagered),
        totalWon: parseFloat(user.total_won),
        gamesPlayed: user.games_played,
        biggestWin: parseFloat(user.biggest_win),
        createdAt: user.created_at
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Create fairness data for new user
  async createUserFairness(userId) {
    try {
      // Generate server seed
      const serverSeed = crypto.randomBytes(32).toString('hex');
      const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
      
      const seedResult = await this.db.createServerSeed(serverSeedHash, serverSeed);
      
      // Generate client seed
      const clientSeed = crypto.randomBytes(16).toString('hex');
      
      await this.db.createUserFairness(userId, clientSeed, seedResult.id);
      
      return { clientSeed, serverSeedHash };
    } catch (error) {
      console.error('Error creating user fairness:', error);
      throw error;
    }
  }

  // Start a new game session
  async startGameSession(userId, gameType, betAmount, gameData = {}) {
    try {
      const sessionId = uuidv4();
      const fairness = await this.db.getUserFairness(userId);
      
      if (!fairness) {
        throw new Error('User fairness data not found');
      }

      await this.db.createGameSession({
        id: sessionId,
        userId,
        gameType,
        betAmount,
        gameData,
        serverSeed: fairness.seed_value,
        clientSeed: fairness.client_seed,
        nonce: fairness.nonce
      });

      return {
        sessionId,
        serverSeedHash: fairness.seed_hash,
        clientSeed: fairness.client_seed,
        nonce: fairness.nonce
      };
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  }

  // Complete a game and record result
  async completeGame(sessionId, userId, gameType, betAmount, payout, multiplier, won, gameData = {}) {
    try {
      const resultId = uuidv4();
      const fairness = await this.db.getUserFairness(userId);
      
      // Create game result
      await this.db.createGameResult({
        id: resultId,
        sessionId,
        userId,
        gameType,
        betAmount,
        payout,
        multiplier,
        won,
        gameData,
        serverSeed: fairness.seed_value,
        clientSeed: fairness.client_seed,
        nonce: fairness.nonce
      });

      // Update game session status
      await this.db.updateGameSession(sessionId, gameData, 'completed');

      // Update user balance and stats
      const user = await this.db.getUserById(userId);
      const newBalance = user.balance - betAmount + payout;
      
      await this.db.updateUserBalance(userId, newBalance);
      await this.db.updateUserStats(userId, betAmount, payout, won, payout);

      // Increment nonce for next game
      await this.db.updateUserFairness(userId, fairness.nonce + 1);

      // Handle referral earnings if user was referred
      if (user.referred_by && won && payout > betAmount) {
        await this.handleReferralEarning(user.referred_by, userId, resultId, payout - betAmount);
      }

      return {
        resultId,
        newBalance,
        fair: {
          serverSeedHash: fairness.seed_hash,
          clientSeed: fairness.client_seed,
          nonce: fairness.nonce
        }
      };
    } catch (error) {
      console.error('Error completing game:', error);
      throw error;
    }
  }

  // Handle referral earnings (5% of net winnings)
  async handleReferralEarning(referrerCode, referredUserId, gameResultId, netWinnings) {
    try {
      // Find referrer by referral code
      const referrer = await this.db.getUserByReferralCode(referrerCode);
      
      if (referrer) {
        const earningAmount = netWinnings * 0.05; // 5% of net winnings
        
        // Add earning record
        await this.db.createReferralEarning(referrer.id, referredUserId, gameResultId, earningAmount);

        // Update referrer balance
        const newBalance = parseFloat(referrer.balance) + earningAmount;
        await this.db.updateUserBalance(referrer.id, newBalance);
        
        console.log(`💰 Referral earning: ${earningAmount} awarded to ${referrer.username}`);
      }
    } catch (error) {
      console.error('Error handling referral earning:', error);
    }
  }

  // Add chat message
  async addChatMessage(userId, username, message) {
    try {
      const messageId = uuidv4();
      await this.db.addChatMessage({
        id: messageId,
        userId,
        username,
        message
      });
      
      return messageId;
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw error;
    }
  }

  // Get recent chat messages
  async getChatMessages(limit = 50) {
    try {
      return await this.db.getRecentChatMessages(limit);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  // Get leaderboard data
  async getLeaderboard() {
    try {
      return await this.db.getTopWinners(10);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get recent big wins
  async getBigWins() {
    try {
      return await this.db.getRecentBigWins(10, 100);
    } catch (error) {
      console.error('Error getting big wins:', error);
      throw error;
    }
  }

  // Update user's client seed
  async updateClientSeed(userId, newClientSeed) {
    try {
      const fairness = await this.db.getUserFairness(userId);
      await this.db.updateUserFairness(userId, fairness.nonce, newClientSeed);
      
      return {
        clientSeed: newClientSeed,
        nonce: fairness.nonce
      };
    } catch (error) {
      console.error('Error updating client seed:', error);
      throw error;
    }
  }

  // Get user fairness data
  async getUserFairness(userId) {
    try {
      const fairness = await this.db.getUserFairness(userId);
      
      if (!fairness) {
        return null;
      }

      return {
        clientSeed: fairness.client_seed,
        serverSeedHash: fairness.seed_hash,
        nonce: fairness.nonce
      };
    } catch (error) {
      console.error('Error getting user fairness:', error);
      throw error;
    }
  }
}

module.exports = DataService;