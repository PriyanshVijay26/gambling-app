const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.pool = null;
    this.schemaPath = path.join(__dirname, 'schema.sql');
    
    // Database configuration - supports both Railway DATABASE_URL and individual env vars
    if (process.env.DATABASE_URL) {
      // Railway provides DATABASE_URL automatically
      this.config = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };
    } else {
      // Fallback to individual environment variables (for local development)
      this.config = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'gambling_app',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };
    }
  }

  async initialize() {
    try {
      this.pool = new Pool(this.config);
      
      // Test connection
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      client.release();
      
      // Create tables
      await this.createTables();
      
      return true;
    } catch (error) {
      console.error('❌ Error connecting to database:', error.message);
      throw error;
    }
  }

  async createTables() {
    try {
      const schema = fs.readFileSync(this.schemaPath, 'utf8');
      await this.pool.query(schema);
      console.log('✅ Database tables created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error.message);
      throw error;
    }
  }

  // User operations
  async createUser(userData) {
    const { id, username, referralCode, referredBy } = userData;
    
    try {
      const result = await this.pool.query(
        `INSERT INTO users (id, username, referral_code, referred_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, username, referralCode, referredBy]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async getUserByReferralCode(referralCode) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE referral_code = $1',
        [referralCode]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async updateUserBalance(userId, newBalance) {
    try {
      const result = await this.pool.query(
        `UPDATE users 
         SET balance = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2
         RETURNING *`,
        [newBalance, userId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateUserStats(userId, wagered, won, isWin, winAmount = 0) {
    try {
      const result = await this.pool.query(
        `UPDATE users 
         SET total_wagered = total_wagered + $1,
             total_won = total_won + $2,
             games_played = games_played + 1,
             biggest_win = CASE WHEN $3 > biggest_win THEN $3 ELSE biggest_win END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [wagered, won, winAmount, userId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Game session operations
  async createGameSession(sessionData) {
    const { id, userId, gameType, betAmount, gameData, serverSeed, clientSeed, nonce } = sessionData;
    
    try {
      const result = await this.pool.query(
        `INSERT INTO game_sessions (id, user_id, game_type, bet_amount, game_data, server_seed, client_seed, nonce)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id, userId, gameType, betAmount, JSON.stringify(gameData), serverSeed, clientSeed, nonce]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateGameSession(sessionId, gameData, status = 'active') {
    try {
      const result = await this.pool.query(
        `UPDATE game_sessions 
         SET game_data = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3
         RETURNING *`,
        [JSON.stringify(gameData), status, sessionId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getGameSession(sessionId) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM game_sessions WHERE id = $1',
        [sessionId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Game result operations
  async createGameResult(resultData) {
    const { id, sessionId, userId, gameType, betAmount, payout, multiplier, won, gameData, serverSeed, clientSeed, nonce } = resultData;
    
    try {
      const result = await this.pool.query(
        `INSERT INTO game_results (id, session_id, user_id, game_type, bet_amount, payout, multiplier, won, game_data, server_seed, client_seed, nonce)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [id, sessionId, userId, gameType, betAmount, payout, multiplier, won, JSON.stringify(gameData), serverSeed, clientSeed, nonce]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Chat operations
  async addChatMessage(messageData) {
    const { id, userId, username, message } = messageData;
    
    try {
      const result = await this.pool.query(
        `INSERT INTO chat_messages (id, user_id, username, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, userId, username, message]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getRecentChatMessages(limit = 50) {
    try {
      const result = await this.pool.query(
        `SELECT id, user_id, username, message, created_at 
         FROM chat_messages 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows.reverse(); // Return in chronological order
    } catch (error) {
      throw error;
    }
  }

  // Fairness operations
  async createServerSeed(seedHash, seedValue) {
    try {
      const result = await this.pool.query(
        `INSERT INTO server_seeds (seed_hash, seed_value)
         VALUES ($1, $2)
         RETURNING *`,
        [seedHash, seedValue]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async createUserFairness(userId, clientSeed, serverSeedId) {
    try {
      const result = await this.pool.query(
        `INSERT INTO user_fairness (user_id, client_seed, nonce, current_server_seed_id)
         VALUES ($1, $2, 0, $3)
         ON CONFLICT (user_id) DO UPDATE SET
         client_seed = $2, nonce = 0, current_server_seed_id = $3
         RETURNING *`,
        [userId, clientSeed, serverSeedId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateUserFairness(userId, nonce, clientSeed = null) {
    try {
      let query, params;
      
      if (clientSeed) {
        query = `
          UPDATE user_fairness 
          SET nonce = $1, client_seed = $2, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $3
          RETURNING *
        `;
        params = [nonce, clientSeed, userId];
      } else {
        query = `
          UPDATE user_fairness 
          SET nonce = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $2
          RETURNING *
        `;
        params = [nonce, userId];
      }
      
      const result = await this.pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getUserFairness(userId) {
    try {
      const result = await this.pool.query(
        `SELECT uf.*, ss.seed_hash, ss.seed_value 
         FROM user_fairness uf
         LEFT JOIN server_seeds ss ON uf.current_server_seed_id = ss.id
         WHERE uf.user_id = $1`,
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Referral operations
  async createReferralEarning(referrerId, referredId, gameResultId, earningAmount) {
    try {
      const result = await this.pool.query(
        `INSERT INTO referral_earnings (id, referrer_id, referred_id, game_result_id, earning_amount)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         RETURNING *`,
        [referrerId, referredId, gameResultId, earningAmount]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Statistics and leaderboards
  async getTopWinners(limit = 10) {
    try {
      const result = await this.pool.query(
        `SELECT username, biggest_win, total_won, games_played
         FROM users 
         WHERE biggest_win > 0
         ORDER BY biggest_win DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getRecentBigWins(limit = 10, minAmount = 100) {
    try {
      const result = await this.pool.query(
        `SELECT gr.payout, gr.game_type, gr.multiplier, gr.created_at, u.username
         FROM game_results gr
         JOIN users u ON gr.user_id = u.id
         WHERE gr.payout >= $1 AND gr.won = true
         ORDER BY gr.created_at DESC
         LIMIT $2`,
        [minAmount, limit]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getGameStats() {
    try {
      const result = await this.pool.query(
        `SELECT 
           game_type,
           COUNT(*) as total_games,
           SUM(bet_amount) as total_wagered,
           SUM(payout) as total_payout,
           AVG(multiplier) as avg_multiplier,
           COUNT(*) FILTER (WHERE won = true) as wins
         FROM game_results 
         GROUP BY game_type
         ORDER BY total_games DESC`
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Close database connection
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection pool closed');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      return { status: 'healthy', timestamp: result.rows[0].now };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = Database;