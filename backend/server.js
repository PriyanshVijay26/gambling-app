const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
require('dotenv').config();

// Import database and data service
const Database = require('./database/database');
const DataService = require('./database/dataService');

// Import new backend systems
const { router: rakebackRouter, setupRakebackSockets } = require('./routes/rakeback');
const { router: paymentsRouter, setupPaymentSockets } = require('./routes/payments');
const { router: bankingRouter, setupBankingSockets } = require('./routes/banking');

// Import game logic
const MinesGame = require('./games/MinesGame');
const CoinFlipGame = require('./games/CoinFlipGame');
const CrashGame = require('./games/CrashGame');
const LimboGame = require('./games/LimboGame');
const UpgraderGame = require('./games/UpgraderGame');
const MurderMysteryGame = require('./games/MurderMysteryGame');
const DiceGame = require('./games/DiceGame');
const PlinkoGame = require('./games/PlinkoGame');
const TowersGame = require('./games/TowersGame');
const { createRNG, fairMeta } = require('./utils/fairness');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://gamblingapp.netlify.app", // Replace with your actual Netlify URL
    "https://your-frontend-domain.netlify.app" // Add your actual Netlify domain
  ],
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Add new backend routes
app.use('/api/rakeback', rakebackRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/banking', bankingRouter);

// Socket.IO setup
const io = socketIo(server, {
  cors: corsOptions,
  transports: ["polling", "websocket"], // Start with polling first
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8,
  allowEIO3: true
});

// Initialize database
let database;
let dataService;

async function initializeDatabase() {
  try {
    // Only try to connect to database if DATABASE_URL is provided
    if (process.env.DATABASE_URL) {
      database = new Database();
      await database.initialize();
      dataService = new DataService(database);
      console.log('✅ Database and data service initialized successfully');
    } else {
      console.log('⚠️  Running without database (in-memory mode)');
      console.log('   💡 Database features will be disabled');
      console.log('   🚀 To enable database: add PostgreSQL add-on and set DATABASE_URL');
      database = null;
      dataService = null;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('   💡 Continuing without database - using in-memory storage');
    console.log('   🔧 To fix: check DATABASE_URL or add PostgreSQL add-on');
    database = null;
    dataService = null;
  }
}

// In-memory storage for active sessions and games
const userSessions = new Map();
const activeGames = new Map();
const activeMurderMysteryGames = new Map(); // For multiplayer Murder Mystery games

// Provably fair setup
const provablyFair = {
  serverSeed: crypto.randomBytes(32).toString('hex'),
  serverSeedHash: '',
  rotateAt: Date.now() + 24 * 60 * 60 * 1000,
};
provablyFair.serverSeedHash = crypto
  .createHash('sha256')
  .update(provablyFair.serverSeed)
  .digest('hex');

// Helper functions
function updateUserStats(socketId, won, winnings) {
  const user = userSessions.get(socketId);
  if (user) {
    user.stats.gamesPlayed++;
    if (won) {
      user.stats.wins++;
      user.stats.totalWinnings += winnings;
    } else {
      user.stats.losses++;
    }
  }
}

// Basic REST endpoints
app.get('/api/health', async (req, res) => {
  try {
    let dbHealth = { status: 'disabled', message: 'Running in development mode' };
    
    if (database) {
      dbHealth = await database.healthCheck();
    }
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      connections: userSessions.size,
      activeGames: activeGames.size,
      database: dbHealth,
      mode: database ? 'production' : 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/api/fair/current', (req, res) => {
  res.json({
    serverSeedHash: provablyFair.serverSeedHash,
    rotateAt: provablyFair.rotateAt,
  });
});

// Analytics endpoints
app.post('/api/analytics', (req, res) => {
  // For now, just log analytics data and return success
  console.log('📊 Analytics data received:', {
    eventsCount: req.body.events?.length || 0,
    errorsCount: req.body.errors?.length || 0,
    sessionId: req.body.session?.sessionId
  });
  res.json({ status: 'success', received: Date.now() });
});

app.post('/api/analytics/event', (req, res) => {
  console.log('📈 Analytics event:', req.body.name, req.body.properties);
  res.json({ status: 'success' });
});

app.post('/api/analytics/error', (req, res) => {
  console.log('🚨 Analytics error:', req.body.type, req.body.message);
  res.json({ status: 'success' });
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  console.log(`🚀 Transport: ${socket.conn.transport.name}`);
  
  // Handle transport upgrades
  socket.conn.on('upgrade', () => {
    console.log(`⬆️ Socket ${socket.id} upgraded to: ${socket.conn.transport.name}`);
  });
  
  socket.conn.on('upgradeError', (error) => {
    console.warn(`⚠️ Socket ${socket.id} upgrade failed:`, error.message);
  });
  
  // Initialize user session (temporary in-memory for this socket)
  userSessions.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    currentGame: null,
    userId: null, // Will be set when user profile is created
    fairness: { 
      clientSeed: socket.id, 
      nonce: 0 
    },
    profile: { 
      username: '', 
      avatar: '' 
    },
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalWinnings: 0
    }
  });
  
  console.log(`✅ User session created for ${socket.id}`);

  // Test connection
  socket.on('test:ping', (data) => {
    console.log(`🏓 Ping received from ${socket.id}:`, data);
    socket.emit('test:pong', { 
      ...data, 
      serverTime: Date.now(),
      message: 'Pong from server!' 
    });
  });

  // User profile management
  socket.on('user:setProfile', async (data) => {
    console.log(`👤 Setting profile for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      const username = String(data.username || '').trim().slice(0, 20);
      const avatar = String(data.avatar || '').trim().slice(0, 300);
      const referredBy = data.referralCode ? String(data.referralCode).trim() : null;
      
      if (!username) {
        socket.emit('error', { message: 'Username is required' });
        return;
      }

      // Update session
      user.profile.username = username;
      user.profile.avatar = avatar;
      
      if (dataService) {
        // Database mode: Create or get user from database
        let dbUser;
        if (!user.userId) {
          // Create new user
          dbUser = await dataService.createUser(username, referredBy);
          user.userId = dbUser.id;
          console.log(`🆕 Created new user: ${dbUser.id} (${username})`);
        } else {
          // Get existing user
          dbUser = await dataService.getUser(user.userId);
        }
        
        socket.emit('user:profile', {
          ...user.profile,
          balance: dbUser.balance,
          referralCode: dbUser.referralCode,
          stats: {
            gamesPlayed: dbUser.gamesPlayed,
            totalWagered: dbUser.totalWagered,
            totalWon: dbUser.totalWon,
            biggestWin: dbUser.biggestWin
          }
        });
      } else {
        // In-memory mode: Use session data
        socket.emit('user:profile', {
          ...user.profile,
          balance: 1000, // Default balance
          referralCode: 'DEV' + socket.id.slice(-4), // Mock referral code
          stats: user.stats
        });
      }
      
    } catch (error) {
      console.error('Error setting user profile:', error);
      socket.emit('error', { message: 'Failed to set profile' });
    }
  });

  // Fairness seed management
  socket.on('fair:setClientSeed', (seed) => {
    console.log(`🎲 Setting client seed for ${socket.id}:`, seed);
    const user = userSessions.get(socket.id);
    if (user) {
      user.fairness.clientSeed = String(seed || '').trim().slice(0, 64) || socket.id;
      user.fairness.nonce = 0;
      socket.emit('fair:updated', { clientSeed: user.fairness.clientSeed });
    }
  });

  socket.on('fair:get', () => {
    const user = userSessions.get(socket.id);
    socket.emit('fair:state', {
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: user?.fairness?.clientSeed || socket.id,
      nonce: user?.fairness?.nonce || 0,
      rotateAt: provablyFair.rotateAt,
    });
  });

  // === COINFLIP GAME EVENTS ===
  socket.on('coinflip:play', (data) => {
    console.log(`🪙 Playing Coin Flip for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );

      // Create and play coinflip game
      const game = new CoinFlipGame(socket.id, data, rng);
      const result = game.flip();
      
      console.log(`🎲 Coinflip result:`, result);
      
      // Update user stats
      updateUserStats(socket.id, result.won, result.winnings);
      
      // Send result to client
      const response = {
        ...result,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      };
      
      socket.emit('coinflip:result', response);
      
      console.log(`✅ Coinflip result sent successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error playing coinflip for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to play coinflip: ' + error.message });
    }
  });

  // === CRASH GAME EVENTS ===
  socket.on('crash:join', (data) => {
    console.log(`⚡ Joining Crash game for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );

      // Create new crash game
      const game = new CrashGame(socket.id, data, rng);
      const gameId = uuidv4();
      
      console.log(`⚡ Created Crash game:`, {
        gameId,
        betAmount: game.betAmount,
        crashPoint: game.crashPoint
      });
      
      // Store game
      activeGames.set(gameId, game);
      user.currentGame = gameId;

      // Send initial game state
      const gameState = {
        gameId,
        betAmount: game.betAmount,
        currentMultiplier: game.currentMultiplier,
        crashed: game.crashed,
        cashedOut: game.cashedOut,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      };
      
      socket.emit('crash:joined', gameState);
      
      // Start the crash game loop
      const gameLoop = setInterval(() => {
        const tick = game.tick();
        
        // Send multiplier update
        socket.emit('crash:multiplier', { 
          multiplier: tick.multiplier,
          crashed: tick.crashed 
        });
        
        // If crashed, end game
        if (tick.crashed) {
          clearInterval(gameLoop);
          
          const result = game.getResult();
          updateUserStats(socket.id, result.won, result.winnings);
          
          socket.emit('crash:crashed', {
            ...result,
            fair: fairMeta(
              provablyFair.serverSeedHash, 
              user.fairness.clientSeed, 
              user.fairness.nonce - 1
            )
          });
          
          // Clean up game
          activeGames.delete(gameId);
          user.currentGame = null;
          
          console.log(`⚡ Crash game ${gameId} ended. Crashed at: ${tick.multiplier}x`);
        }
      }, 100); // Update every 100ms
      
      // Store the interval so we can clear it during cash out
      game.gameLoop = gameLoop;
      
      console.log(`✅ Crash game started successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error joining crash game for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to join crash game: ' + error.message });
    }
  });

  socket.on('crash:cashOut', (data) => {
    console.log(`💰 Crash cash out for ${socket.id}:`, data);
    
    try {
      const game = activeGames.get(data.gameId);
      if (!game || game.playerId !== socket.id) {
        socket.emit('error', { message: 'Game not found or unauthorized' });
        return;
      }

      // Stop the game loop immediately to prevent crash event
      if (game.gameLoop) {
        clearInterval(game.gameLoop);
        console.log(`⚙️ Cleared game loop for ${data.gameId}`);
      }

      const result = game.cashOut();
      console.log(`💵 Crash cash out result:`, result);
      
      updateUserStats(socket.id, result.won, result.winnings);
      
      socket.emit('crash:cashedOut', {
        ...result,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          userSessions.get(socket.id).fairness.clientSeed, 
          userSessions.get(socket.id).fairness.nonce - 1
        )
      });
      
      // Clean up game immediately after cash out
      activeGames.delete(data.gameId);
      const user = userSessions.get(socket.id);
      if (user) user.currentGame = null;
      
      console.log(`✅ Crash cash out successful for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error cashing out crash game for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to cash out' });
    }
  });

  // === LIMBO GAME EVENTS ===
  socket.on('limbo:play', (data) => {
    console.log(`📈 Playing Limbo for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );

      // Create new limbo game
      const game = new LimboGame(socket.id, data, rng);
      const result = game.play();
      
      console.log(`📈 Limbo game result:`, {
        actualMultiplier: result.actualMultiplier,
        targetMultiplier: result.targetMultiplier,
        won: result.won,
        winnings: result.winnings
      });
      
      updateUserStats(socket.id, result.won, result.winnings);
      
      socket.emit('limbo:result', {
        ...result,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      });
      
      console.log(`✅ Limbo game completed successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error playing limbo for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to play limbo: ' + error.message });
    }
  });

  // === DICE GAME EVENTS ===
  socket.on('dice:roll', (data) => {
    console.log(`🎲 Rolling dice for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );

      // Create and play dice game
      const game = new DiceGame(socket.id, data, rng);
      const result = game.roll();
      
      console.log(`🎲 Dice roll result:`, {
        actualRoll: result.actualRoll,
        target: result.target,
        rollOver: result.rollOver,
        won: result.won,
        winnings: result.winnings
      });
      
      updateUserStats(socket.id, result.won, result.winnings);
      
      socket.emit('dice:result', {
        ...result,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      });
      
      console.log(`✅ Dice roll completed successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error rolling dice for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to roll dice: ' + error.message });
    }
  });

  // === PLINKO GAME EVENTS ===
  socket.on('plinko:drop', (data) => {
    console.log(`🔺 Dropping Plinko ball for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );

      // Create and play plinko game
      const game = new PlinkoGame(socket.id, data, rng);
      const result = game.drop();
      
      console.log(`🔺 Plinko drop result:`, {
        bucket: result.bucket,
        multiplier: result.multiplier,
        risk: result.risk,
        won: result.won,
        winnings: result.winnings
      });
      
      updateUserStats(socket.id, result.won, result.winnings);
      
      socket.emit('plinko:result', {
        ...result,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      });
      
      console.log(`✅ Plinko drop completed successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error dropping plinko ball for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to drop plinko ball: ' + error.message });
    }
  });

  // === TOWERS GAME EVENTS ===
  socket.on('towers:startGame', (data) => {
    console.log(`🏢 Starting Towers game for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );

      // Create new towers game
      const game = new TowersGame(socket.id, data, rng);
      const gameId = uuidv4();
      
      console.log(`🏢 Created Towers game:`, {
        gameId,
        betAmount: game.betAmount,
        difficulty: game.difficulty,
        levels: game.levels
      });
      
      // Store game
      activeGames.set(gameId, game);
      user.currentGame = gameId;

      // Send initial game state
      const gameState = {
        gameId,
        currentLevel: game.currentLevel,
        levels: game.levels,
        blocksPerLevel: game.blocksPerLevel,
        multiplier: game.getCurrentMultiplier(),
        betAmount: game.betAmount,
        difficulty: game.difficulty,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      };
      
      socket.emit('towers:gameState', gameState);
      
      console.log(`✅ Towers game started successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error starting towers game for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to start towers game: ' + error.message });
    }
  });

  socket.on('towers:selectBlock', (data) => {
    console.log(`🏢 Block selection for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user || !user.currentGame) {
        socket.emit('error', { message: 'No active game found' });
        return;
      }

      const game = activeGames.get(user.currentGame);
      if (!game || game.playerId !== socket.id) {
        socket.emit('error', { message: 'Game not found or unauthorized' });
        return;
      }

      const result = game.selectBlock(game.currentLevel, data.position);
      console.log(`🏢 Block selection result:`, result);
      
      const gameState = {
        gameId: user.currentGame,
        currentLevel: game.currentLevel,
        levels: game.levels,
        blocksPerLevel: game.blocksPerLevel,
        multiplier: game.getCurrentMultiplier(),
        betAmount: game.betAmount,
        difficulty: game.difficulty,
        gameOver: result.gameOver || false,
        won: result.won || false,
        winnings: result.winnings || 0
      };

      let response = {
        gameState,
        success: result.success,
        correct: result.correct,
        gameOver: result.gameOver || false
      };

      if (result.gameOver) {
        response.won = result.won || false;
        response.winnings = result.winnings || 0;
        response.fair = fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        );
        
        updateUserStats(socket.id, result.won || false, result.winnings || 0);
        
        // Clean up game
        activeGames.delete(user.currentGame);
        user.currentGame = null;
      }
      
      socket.emit('towers:blockResult', response);
      
      console.log(`✅ Towers block selection processed for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error processing towers block selection for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to process block selection: ' + error.message });
    }
  });

  socket.on('towers:cashOut', (data) => {
    console.log(`💰 Towers cash out for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user || !user.currentGame) {
        socket.emit('error', { message: 'No active game found' });
        return;
      }

      const game = activeGames.get(user.currentGame);
      if (!game || game.playerId !== socket.id) {
        socket.emit('error', { message: 'Game not found or unauthorized' });
        return;
      }

      const winnings = game.cashOut();
      console.log(`💵 Towers cash out winnings: ${winnings}`);
      
      updateUserStats(socket.id, true, winnings);
      
      const gameState = {
        gameId: user.currentGame,
        currentLevel: game.currentLevel,
        levels: game.levels,
        blocksPerLevel: game.blocksPerLevel,
        multiplier: game.getCurrentMultiplier(),
        betAmount: game.betAmount,
        difficulty: game.difficulty,
        gameOver: true,
        won: true,
        winnings: winnings
      };

      socket.emit('towers:cashedOut', {
        gameState,
        won: true,
        winnings,
        reason: 'cashout',
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      });
      
      // Clean up game
      activeGames.delete(user.currentGame);
      user.currentGame = null;
      
      console.log(`✅ Towers cash out successful for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error cashing out towers for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to cash out: ' + error.message });
    }
  });

  // === UPGRADER GAME EVENTS ===
  socket.on('upgrader:start', (data) => {
    console.log(`🎯 Starting Upgrader game for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );

      // Create new upgrader game
      const game = new UpgraderGame(socket.id, data, rng);
      const gameId = uuidv4();
      
      console.log(`🎯 Created Upgrader game:`, {
        gameId,
        betAmount: game.betAmount,
        currentLevel: game.getCurrentLevel()
      });
      
      // Store game
      activeGames.set(gameId, game);
      user.currentGame = gameId;

      // Send initial game state
      const gameState = {
        gameId,
        currentLevel: game.getCurrentLevel(),
        successChance: game.getSuccessChance(),
        currentMultiplier: game.getCurrentMultiplier(),
        betAmount: game.betAmount,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      };
      
      socket.emit('upgrader:started', gameState);
      
      console.log(`✅ Upgrader game started successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error starting upgrader for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to start upgrader: ' + error.message });
    }
  });

  socket.on('upgrader:upgrade', (data) => {
    console.log(`🔄 Upgrader upgrade attempt for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user || !user.currentGame) {
        socket.emit('error', { message: 'No active game found' });
        return;
      }

      const game = activeGames.get(user.currentGame);
      if (!game || game.playerId !== socket.id) {
        socket.emit('error', { message: 'Game not found or unauthorized' });
        return;
      }

      const result = game.tryUpgrade();
      console.log(`🎯 Upgrade result:`, result);
      
      const gameState = {
        gameId: user.currentGame,
        currentLevel: game.getCurrentLevel(),
        successChance: game.getSuccessChance(),
        currentMultiplier: game.getCurrentMultiplier(),
        betAmount: game.betAmount
      };

      let response = {
        gameState,
        success: result.success,
        gameOver: result.gameOver
      };

      if (result.gameOver) {
        response.won = result.won;
        response.winnings = result.winnings || 0;
        response.reason = result.won ? 'max_level' : 'failed';
        response.fair = fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        );
        
        updateUserStats(socket.id, result.won, result.winnings || 0);
        
        // Clean up game
        activeGames.delete(user.currentGame);
        user.currentGame = null;
      }
      
      socket.emit('upgrader:result', response);
      
      console.log(`✅ Upgrader upgrade processed for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error processing upgrade for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to process upgrade: ' + error.message });
    }
  });

  socket.on('upgrader:cashOut', (data) => {
    console.log(`💰 Upgrader cash out for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user || !user.currentGame) {
        socket.emit('error', { message: 'No active game found' });
        return;
      }

      const game = activeGames.get(user.currentGame);
      if (!game || game.playerId !== socket.id) {
        socket.emit('error', { message: 'Game not found or unauthorized' });
        return;
      }

      const result = game.cashOut();
      console.log(`💵 Upgrader cash out result:`, result);
      
      updateUserStats(socket.id, result.won, result.winnings);
      
      const gameState = {
        gameId: user.currentGame,
        currentLevel: game.getCurrentLevel(),
        successChance: game.getSuccessChance(),
        currentMultiplier: game.getCurrentMultiplier(),
        betAmount: game.betAmount,
        won: result.won,
        winnings: result.winnings
      };

      socket.emit('upgrader:cashedOut', {
        gameState,
        won: result.won,
        winnings: result.winnings,
        reason: 'cashout',
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      });
      
      // Clean up game
      activeGames.delete(user.currentGame);
      user.currentGame = null;
      
      console.log(`✅ Upgrader cash out successful for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error cashing out upgrader for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to cash out: ' + error.message });
    }
  });

  // === MURDER MYSTERY GAME EVENTS ===
  socket.on('mm:joinGame', (data) => {
    console.log(`🕵️‍♂️ Joining Murder Mystery game for ${socket.id}`);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }

      // Find an existing game or create new one
      let gameId = null;
      let game = null;
      
      // Look for a waiting game
      for (const [id, existingGame] of activeMurderMysteryGames) {
        if (existingGame.canJoin()) {
          gameId = id;
          game = existingGame;
          break;
        }
      }
      
      // Create new game if none found
      if (!game) {
        gameId = uuidv4();
        game = new MurderMysteryGame(gameId);
        activeMurderMysteryGames.set(gameId, game);
        console.log(`🎮 Created new Murder Mystery game: ${gameId}`);
      }
      
      // Add player to game
      const joined = game.addPlayer(socket.id, socket);
      if (!joined) {
        socket.emit('error', { message: 'Could not join game' });
        return;
      }
      
      user.currentGame = gameId;
      
      // Broadcast game state to all players in this game
      const gameState = game.getGameState();
      gameState.players.forEach(player => {
        if (player.id === socket.id) {
          player.isUser = true;
        }
      });
      
      // Send to all players in the game
      game.players.forEach(player => {
        const personalizedState = {
          ...gameState,
          players: gameState.players.map(p => ({
            ...p,
            isUser: p.id === player.id
          }))
        };
        player.socket.emit('mm:gameState', personalizedState);
      });
      
      console.log(`✅ Player ${socket.id} joined Murder Mystery game ${gameId}`);

    } catch (error) {
      console.error(`❌ Error joining Murder Mystery game for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to join game: ' + error.message });
    }
  });

  socket.on('mm:leaveGame', (data) => {
    console.log(`🚪 Leaving Murder Mystery game for ${socket.id}`);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user || !user.currentGame) {
        return;
      }

      const game = activeMurderMysteryGames.get(user.currentGame);
      if (game) {
        game.removePlayer(socket.id);
        
        // If no players left, clean up game
        if (game.players.length === 0) {
          activeMurderMysteryGames.delete(user.currentGame);
          console.log(`🗑️ Cleaned up empty Murder Mystery game ${user.currentGame}`);
        } else {
          // Broadcast updated game state
          const gameState = game.getGameState();
          game.players.forEach(player => {
            const personalizedState = {
              ...gameState,
              players: gameState.players.map(p => ({
                ...p,
                isUser: p.id === player.id
              }))
            };
            player.socket.emit('mm:gameState', personalizedState);
          });
        }
      }
      
      user.currentGame = null;
      console.log(`✅ Player ${socket.id} left Murder Mystery game`);

    } catch (error) {
      console.error(`❌ Error leaving Murder Mystery game for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to leave game: ' + error.message });
    }
  });

  socket.on('mm:eliminatePlayer', (data) => {
    console.log(`💥 Eliminate player request for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user || !user.currentGame) {
        socket.emit('error', { message: 'No active game found' });
        return;
      }

      const game = activeMurderMysteryGames.get(user.currentGame);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const result = game.eliminatePlayer(socket.id, data.playerId);
      
      if (!result.success) {
        socket.emit('error', { message: 'Cannot eliminate player' });
        return;
      }
      
      // Broadcast elimination to all players
      const gameState = game.getGameState();
      game.players.forEach(player => {
        const personalizedState = {
          ...gameState,
          players: gameState.players.map(p => ({
            ...p,
            isUser: p.id === player.id
          }))
        };
        player.socket.emit('mm:gameState', personalizedState);
        player.socket.emit('mm:playerEliminated', { 
          eliminatedPlayer: result.eliminated,
          gameOver: result.gameOver,
          winner: result.winner
        });
      });
      
      // Handle game end
      if (result.gameOver) {
        // Update user stats for all players
        game.players.forEach(player => {
          updateUserStats(player.id, player.won, player.winnings || 0);
        });
        
        setTimeout(() => {
          activeMurderMysteryGames.delete(user.currentGame);
          game.players.forEach(player => {
            const userSession = userSessions.get(player.id);
            if (userSession) userSession.currentGame = null;
          });
        }, 5000); // Clean up after 5 seconds
      }
      
      console.log(`✅ Player elimination processed in game ${user.currentGame}`);

    } catch (error) {
      console.error(`❌ Error eliminating player for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to eliminate player: ' + error.message });
    }
  });

  socket.on('mm:accusePlayer', (data) => {
    console.log(`🔍 Accuse player request for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user || !user.currentGame) {
        socket.emit('error', { message: 'No active game found' });
        return;
      }

      const game = activeMurderMysteryGames.get(user.currentGame);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const result = game.accusePlayer(socket.id, data.playerId);
      
      if (!result.success) {
        socket.emit('error', { message: 'Cannot accuse player' });
        return;
      }
      
      // Broadcast accusation result to all players
      const gameState = game.getGameState();
      game.players.forEach(player => {
        const personalizedState = {
          ...gameState,
          players: gameState.players.map(p => ({
            ...p,
            isUser: p.id === player.id
          }))
        };
        player.socket.emit('mm:gameState', personalizedState);
        player.socket.emit('mm:accusationMade', { 
          accusedPlayer: result.accusedPlayer,
          correct: result.correct,
          detectiveEliminated: result.detectiveEliminated,
          gameOver: result.gameOver,
          winner: result.winner
        });
      });
      
      // Handle game end
      if (result.gameOver) {
        // Update user stats for all players
        game.players.forEach(player => {
          updateUserStats(player.id, player.won, player.winnings || 0);
        });
        
        setTimeout(() => {
          activeMurderMysteryGames.delete(user.currentGame);
          game.players.forEach(player => {
            const userSession = userSessions.get(player.id);
            if (userSession) userSession.currentGame = null;
          });
        }, 5000); // Clean up after 5 seconds
      }
      
      console.log(`✅ Player accusation processed in game ${user.currentGame}`);

    } catch (error) {
      console.error(`❌ Error accusing player for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to accuse player: ' + error.message });
    }
  });

  // === MINES GAME EVENTS ===
  socket.on('mines:startGame', (data) => {
    console.log(`🎮 Starting Mines game for ${socket.id}:`, data);
    
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        console.error(`❌ User session not found for ${socket.id}`);
        socket.emit('error', { message: 'User session not found' });
        return;
      }
      
      console.log(`🎲 Creating RNG for user ${socket.id} with nonce ${user.fairness.nonce}`);

      // Create RNG for this game
      const rng = createRNG(
        provablyFair.serverSeed, 
        user.fairness.clientSeed, 
        user.fairness.nonce++
      );
      
      console.log(`🎯 Creating MinesGame with params:`, {
        playerId: socket.id,
        betAmount: data.betAmount,
        mineCount: data.mineCount,
        gridSize: data.gridSize
      });

      // Create new mines game
      let game;
      try {
        game = new MinesGame(socket.id, data, rng);
        console.log(`🎮 MinesGame constructor completed successfully`);
      } catch (constructorError) {
        console.error(`❌ Error in MinesGame constructor:`, constructorError);
        console.error(`❌ Constructor error stack:`, constructorError.stack);
        throw constructorError;
      }
      
      const gameId = uuidv4();
      console.log(`🆔 Generated gameId: ${gameId}`);
      
      console.log(`🎮 Game created successfully:`, {
        gameId,
        actualGridSize: game.gridSize,
        actualMineCount: game.mineCount,
        gridLength: game.gridLength
      });
      
      // Store game
      activeGames.set(gameId, game);
      user.currentGame = gameId;

      // Send game state to client
      const gameState = {
        gameId,
        state: 'playing',
        grid: game.getPublicGrid(),
        multiplier: game.getCurrentMultiplier(),
        revealed: game.getRevealedCount(),
        gridSize: game.gridSize,
        mineCount: game.mineCount,
        betAmount: game.betAmount,
        fair: fairMeta(
          provablyFair.serverSeedHash, 
          user.fairness.clientSeed, 
          user.fairness.nonce - 1
        )
      };

      console.log(`📡 Sending game state for ${gameId}:`, {
        gameId,
        state: gameState.state,
        gridSize: gameState.gridSize,
        mineCount: gameState.mineCount,
        gridLength: gameState.grid.length
      });
      
      // Send the response
      socket.emit('mines:gameState', gameState);
      
      console.log(`✅ Game state sent successfully for ${socket.id}`);

    } catch (error) {
      console.error(`❌ Error starting mines game for ${socket.id}:`, error);
      console.error(`❌ Error stack:`, error.stack);
      socket.emit('error', { message: 'Failed to start game: ' + error.message });
    }
  });

  socket.on('mines:revealCell', (data) => {
    console.log(`🔍 Revealing cell for ${socket.id}:`, data);
    
    try {
      const game = activeGames.get(data.gameId);
      if (!game || game.playerId !== socket.id) {
        socket.emit('error', { message: 'Game not found or unauthorized' });
        return;
      }

      const result = game.revealCell(data.cellIndex);
      console.log(`📊 Cell reveal result:`, result);

      const response = {
        grid: game.getPublicGrid(),
        multiplier: game.getCurrentMultiplier(),
        revealed: game.getRevealedCount(),
        mine: result.mine,
        gameOver: result.gameOver,
        won: result.won,
        winnings: result.winnings
      };

      socket.emit('mines:cellRevealed', response);

      // Handle game over
      if (result.gameOver) {
        console.log(`🏁 Game ${data.gameId} ended. Won: ${result.won}, Winnings: ${result.winnings}`);
        updateUserStats(socket.id, result.won, result.winnings || 0);
        
        // Clean up game
        activeGames.delete(data.gameId);
        const user = userSessions.get(socket.id);
        if (user) user.currentGame = null;
      }

    } catch (error) {
      console.error(`❌ Error revealing cell for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to reveal cell' });
    }
  });

  socket.on('mines:cashOut', (data) => {
    console.log(`💰 Cash out for ${socket.id}:`, data);
    
    try {
      const game = activeGames.get(data.gameId);
      if (!game || game.playerId !== socket.id) {
        socket.emit('error', { message: 'Game not found or unauthorized' });
        return;
      }

      const winnings = game.cashOut();
      console.log(`💵 Cash out winnings: ${winnings}`);
      
      updateUserStats(socket.id, true, winnings);
      
      socket.emit('mines:cashedOut', { 
        winnings,
        multiplier: game.getCurrentMultiplier()
      });

      // Clean up game
      activeGames.delete(data.gameId);
      const user = userSessions.get(socket.id);
      if (user) user.currentGame = null;

    } catch (error) {
      console.error(`❌ Error cashing out for ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to cash out' });
    }
  });

  // Initialize new backend socket systems
  socket.userId = socket.id; // Set userId for new systems
  setupRakebackSockets(io);
  setupPaymentSockets(io);
  setupBankingSockets(io);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
    
    // Clean up user session
    const user = userSessions.get(socket.id);
    if (user && user.currentGame) {
      // Check if it's a Murder Mystery game
      const mmGame = activeMurderMysteryGames.get(user.currentGame);
      if (mmGame) {
        mmGame.removePlayer(socket.id);
        
        // If no players left, clean up game
        if (mmGame.players.length === 0) {
          activeMurderMysteryGames.delete(user.currentGame);
          console.log(`🗑️ Cleaned up empty Murder Mystery game ${user.currentGame}`);
        } else {
          // Broadcast updated game state to remaining players
          const gameState = mmGame.getGameState();
          mmGame.players.forEach(player => {
            const personalizedState = {
              ...gameState,
              players: gameState.players.map(p => ({
                ...p,
                isUser: p.id === player.id
              }))
            };
            player.socket.emit('mm:gameState', personalizedState);
          });
        }
      } else {
        // Regular single-player game cleanup
        activeGames.delete(user.currentGame);
      }
    }
    userSessions.delete(socket.id);
  });
});

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Frontend URL: http://localhost:5173`);
      console.log(`🎲 Server seed hash: ${provablyFair.serverSeedHash.slice(0, 10)}...`);
      console.log(`💾 Database: ${database ? 'Connected and ready' : 'Running in-memory mode'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('♾️ Received SIGINT, shutting down gracefully...');
  
  if (database) {
    await database.close();
  }
  
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('♾️ Received SIGTERM, shutting down gracefully...');
  
  if (database) {
    await database.close();
  }
  
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

// Start the server
startServer();