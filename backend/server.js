const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const crypto = require('crypto');
const app = express();
const { createRNG, fairMeta } = require('./utils/fairness');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const gameRooms = new Map();
const userSessions = new Map();
const gameHistory = new Map();
const chatHistory = [];
const leaderboard = [];
const bigWins = [];
const referralCodes = new Map();
const referralStats = new Map();
const provablyFair = {
  serverSeed: crypto.randomBytes(32).toString('hex'),
  serverSeedHash: '',
  rotateAt: Date.now() + 24 * 60 * 60 * 1000,
};
provablyFair.serverSeedHash = crypto
  .createHash('sha256')
  .update(provablyFair.serverSeed)
  .digest('hex');

// Game logic imports
const MinesGame = require('./games/MinesGame');
const CoinFlipGame = require('./games/CoinFlipGame');
const LimboGame = require('./games/LimboGame');
const CrashGame = require('./games/CrashGame');
const UpgraderGame = require('./games/UpgraderGame');
const MurderMysteryGame = require('./games/MurderMysteryGame');
const DiceGame = require('./games/DiceGame');
const PlinkoGame = require('./games/PlinkoGame');
const TowersGame = require('./games/TowersGame');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
  res.json({
    activeConnections: userSessions.size,
    activeGames: gameRooms.size,
    gamesPlayed: gameHistory.size
  });
});

// Provably fair endpoints
app.get('/api/fair/current', (req, res) => {
  res.json({
    serverSeedHash: provablyFair.serverSeedHash,
    rotateAt: provablyFair.rotateAt,
  });
});

app.get('/api/fair/reveal', (req, res) => {
  res.json({
    serverSeed: provablyFair.serverSeed,
    serverSeedHash: provablyFair.serverSeedHash,
  });
});

// Leaderboard (top by totalWinnings)
app.get('/api/leaderboard', (req, res) => {
  const entries = Array.from(userSessions.values()).map(u => ({
    id: u.id,
    username: u.profile?.username || '',
    totalWinnings: u.stats.totalWinnings || 0,
    gamesPlayed: u.stats.gamesPlayed || 0,
    wins: u.stats.wins || 0,
  }));
  entries.sort((a, b) => b.totalWinnings - a.totalWinnings);
  res.json(entries.slice(0, 50));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Store user session
  userSessions.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    currentGame: null,
    fairness: { clientSeed: socket.id, nonce: 0 },
    profile: { username: '', avatar: '' },
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalWinnings: 0
    }
  });

  // Dashboard data request
  socket.on('getDashboardData', () => {
    const userSession = userSessions.get(socket.id);
    socket.emit('dashboardData', {
      stats: {
        totalGames: userSession.stats.gamesPlayed,
        winRate: userSession.stats.gamesPlayed > 0 ? 
          Math.round((userSession.stats.wins / userSession.stats.gamesPlayed) * 100) : 0,
        totalWinnings: userSession.stats.totalWinnings,
        currentStreak: 0 // TODO: Calculate streak
      },
      recentGames: [], // TODO: Get from game history
      activeGames: Array.from(gameRooms.values()).map(room => ({
        type: room.gameType,
        players: room.players.length,
        pot: room.totalPot || 0
      }))
    });
  });

  // Basic guest profile
  socket.on('user:setProfile', ({ username, avatar } = {}) => {
    const u = userSessions.get(socket.id);
    if (!u) return;
    const name = String(username || '').trim().slice(0, 20);
    const av = String(avatar || '').trim().slice(0, 300);
    u.profile.username = name;
    u.profile.avatar = av;
    socket.emit('user:profile', u.profile);
  });

  // Global chat
  socket.on('chat:message', (msg) => {
    const text = sanitizeMessage(String(msg?.text || ''));
    if (!text) return;
    const u = userSessions.get(socket.id);
    const payload = {
      id: uuidv4(),
      userId: socket.id,
      username: String(msg?.username || u?.profile?.username || '').slice(0, 20),
      avatar: String(msg?.avatar || u?.profile?.avatar || ''),
      text,
      ts: Date.now(),
    };
    chatHistory.push(payload);
    if (chatHistory.length > 200) chatHistory.shift();
    io.emit('chat:message', payload);
  });

  socket.on('chat:history', () => {
    socket.emit('chat:history', chatHistory);
  });

  // Fairness seed management
  socket.on('fair:setClientSeed', (seed) => {
    const s = String(seed || '').trim().slice(0, 64) || socket.id;
    const user = userSessions.get(socket.id);
    if (user) {
      user.fairness.clientSeed = s;
      user.fairness.nonce = 0;
      socket.emit('fair:updated', { clientSeed: s });
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

  // Mines Game Events
  socket.on('mines:startGame', (data) => {
    const user = userSessions.get(socket.id);
    const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
    const game = new MinesGame(socket.id, data, rng);
    const gameId = uuidv4();
    gameRooms.set(gameId, game);
    
    userSessions.get(socket.id).currentGame = gameId;
    
    socket.emit('mines:gameState', {
      gameId,
      state: 'playing',
      grid: game.getPublicGrid(),
      multiplier: game.getCurrentMultiplier(),
      revealed: game.getRevealedCount(),
      fair: fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1),
    });
  });

  socket.on('mines:revealCell', (data) => {
    const game = gameRooms.get(data.gameId);
    if (game && game.playerId === socket.id) {
      const result = game.revealCell(data.cellIndex);
      
      socket.emit('mines:cellRevealed', {
        grid: game.getPublicGrid(),
        multiplier: game.getCurrentMultiplier(),
        revealed: game.getRevealedCount(),
        mine: result.mine,
        gameOver: result.gameOver
      });

      if (result.gameOver) {
        updateUserStats(socket.id, result.won, result.winnings);
        gameRooms.delete(data.gameId);
        userSessions.get(socket.id).currentGame = null;
      }
    }
  });

  socket.on('mines:cashOut', (data) => {
    const game = gameRooms.get(data.gameId);
    if (game && game.playerId === socket.id) {
      const winnings = game.cashOut();
      updateUserStats(socket.id, true, winnings);
      gameRooms.delete(data.gameId);
      userSessions.get(socket.id).currentGame = null;
    }
  });

  // Coin Flip Game Events
  socket.on('coinflip:play', (data) => {
  const user = userSessions.get(socket.id);
  const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
  const game = new CoinFlipGame(socket.id, data, rng);
  const result = game.flip();
  result.fair = fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1);
    
    updateUserStats(socket.id, result.won, result.winnings);
    
    socket.emit('coinflip:result', result);
  });

  // Limbo Game Events
  socket.on('limbo:play', (data) => {
  const user = userSessions.get(socket.id);
  const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
  const game = new LimboGame(socket.id, data, rng);
  const result = game.play();
  result.fair = fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1);
    
    updateUserStats(socket.id, result.won, result.winnings);
    
    socket.emit('limbo:result', result);
  });

  // Crash Game Events
  socket.on('crash:startGame', (data) => {
  const user = userSessions.get(socket.id);
  const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
  const game = new CrashGame(socket.id, data, rng);
    const gameId = uuidv4();
    gameRooms.set(gameId, game);
    
    userSessions.get(socket.id).currentGame = gameId;
    
    game.start((multiplier, crashed) => {
      socket.emit('crash:update', { multiplier, crashed });
      
      if (crashed) {
        const result = game.getResult();
        result.fair = fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1);
        updateUserStats(socket.id, result.won, result.winnings);
        gameRooms.delete(gameId);
        userSessions.get(socket.id).currentGame = null;
      }
    });
  });

  socket.on('crash:cashOut', (data) => {
    const game = gameRooms.get(data.gameId);
    if (game && game.playerId === socket.id) {
      const result = game.cashOut();
      updateUserStats(socket.id, result.won, result.winnings);
      socket.emit('crash:result', result);
    }
  });

  // Upgrader Game Events
  socket.on('upgrader:start', (data) => {
    const user = userSessions.get(socket.id);
    const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
    const game = new UpgraderGame(socket.id, data, rng);
    const gameId = uuidv4();
    gameRooms.set(gameId, game);
    
    userSessions.get(socket.id).currentGame = gameId;
    
    socket.emit('upgrader:started', {
      gameId,
      currentLevel: game.getCurrentLevel(),
      multiplier: game.getCurrentMultiplier(),
      successChance: game.getSuccessChance()
    });
  });

  socket.on('upgrader:upgrade', () => {
    const userSession = userSessions.get(socket.id);
    const game = gameRooms.get(userSession.currentGame);
    
    if (game && game.playerId === socket.id) {
      const result = game.tryUpgrade();
      
      const response = {
        gameState: {
          currentLevel: game.getCurrentLevel(),
          multiplier: game.getCurrentMultiplier(),
          successChance: game.getSuccessChance(),
          won: result.won,
          winnings: result.winnings || 0
        },
        gameOver: result.gameOver
      };

      if (result.gameOver) {
        response.fair = fairMeta(provablyFair.serverSeedHash, userSessions.get(socket.id).fairness.clientSeed, userSessions.get(socket.id).fairness.nonce - 1);
        updateUserStats(socket.id, result.won, result.winnings || 0);
        
        // Check for big win
        if (result.won && result.winnings >= 100) {
          addBigWin({
            username: userSessions.get(socket.id)?.username,
            userAvatar: userSessions.get(socket.id)?.avatar,
            game: 'upgrader',
            amount: result.winnings,
            timestamp: Date.now()
          });
        }
        
        gameRooms.delete(userSession.currentGame);
        userSessions.get(socket.id).currentGame = null;
      }
      
      socket.emit('upgrader:result', response);
    }
  });

  socket.on('upgrader:cashOut', () => {
    const userSession = userSessions.get(socket.id);
    const game = gameRooms.get(userSession.currentGame);
    
    if (game && game.playerId === socket.id) {
      const result = game.cashOut();
      
      const response = {
        gameState: {
          currentLevel: result.level,
          multiplier: result.multiplier,
          won: result.won,
          winnings: result.winnings,
          reason: 'cashout'
        },
        fair: fairMeta(provablyFair.serverSeedHash, userSessions.get(socket.id).fairness.clientSeed, userSessions.get(socket.id).fairness.nonce - 1)
      };

      updateUserStats(socket.id, true, result.winnings);
      
      // Check for big win
      if (result.winnings >= 100) {
        addBigWin({
          username: userSessions.get(socket.id)?.username,
          userAvatar: userSessions.get(socket.id)?.avatar,
          game: 'upgrader',
          amount: result.winnings,
          timestamp: Date.now()
        });
      }
      
      gameRooms.delete(userSession.currentGame);
      userSessions.get(socket.id).currentGame = null;
      
      socket.emit('upgrader:cashedOut', response);
    }
  });

  // Dice Game Events
  socket.on('dice:roll', (data) => {
    const user = userSessions.get(socket.id);
    const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
    const game = new DiceGame(socket.id, data, rng);
    const result = game.roll();
    result.fair = fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1);
    
    updateUserStats(socket.id, result.won, result.winnings);
    socket.emit('dice:result', result);
    
    // Check for big win
    if (result.won && result.winnings >= 100) {
      addBigWin({
        username: user.username,
        userAvatar: user.avatar,
        game: 'dice',
        amount: result.winnings,
        timestamp: Date.now()
      });
    }
  });

  // Plinko Game Events
  socket.on('plinko:drop', (data) => {
    const user = userSessions.get(socket.id);
    const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
    const game = new PlinkoGame(socket.id, data, rng);
    const result = game.drop();
    result.fair = fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1);
    
    updateUserStats(socket.id, result.won, result.winnings);
    socket.emit('plinko:result', result);
    
    // Check for big win
    if (result.won && result.winnings >= 100) {
      addBigWin({
        username: user.username,
        userAvatar: user.avatar,
        game: 'plinko',
        amount: result.winnings,
        timestamp: Date.now()
      });
    }
  });

  // Towers Game Events
  socket.on('towers:startGame', (data) => {
    const user = userSessions.get(socket.id);
    const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
    const game = new TowersGame(socket.id, data, rng);
    const gameId = uuidv4();
    gameRooms.set(gameId, game);
    
    userSessions.get(socket.id).currentGame = gameId;
    
    socket.emit('towers:gameState', {
      gameId,
      ...game.getGameState(),
      fair: fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1)
    });
  });

  socket.on('towers:selectBlock', (data) => {
    const game = gameRooms.get(data.gameId);
    if (game && game.playerId === socket.id) {
      const result = game.selectBlock(data.level, data.blockIndex);
      
      socket.emit('towers:blockResult', {
        ...result,
        gameState: game.getGameState()
      });
      
      if (result.gameOver) {
        updateUserStats(socket.id, result.won, result.winnings);
        
        // Check for big win
        if (result.won && result.winnings >= 100) {
          const user = userSessions.get(socket.id);
          addBigWin({
            username: user.username,
            userAvatar: user.avatar,
            game: 'towers',
            amount: result.winnings,
            timestamp: Date.now()
          });
        }
        
        gameRooms.delete(data.gameId);
        userSessions.get(socket.id).currentGame = null;
      }
    }
  });

  socket.on('towers:cashOut', (data) => {
    const game = gameRooms.get(data.gameId);
    if (game && game.playerId === socket.id) {
      const winnings = game.cashOut();
      updateUserStats(socket.id, true, winnings);
      
      // Check for big win
      if (winnings >= 100) {
        const user = userSessions.get(socket.id);
        addBigWin({
          username: user.username,
          userAvatar: user.avatar,
          game: 'towers',
          amount: winnings,
          timestamp: Date.now()
        });
      }
      
      gameRooms.delete(data.gameId);
      userSessions.get(socket.id).currentGame = null;
      
      socket.emit('towers:cashedOut', { winnings });
    }
  });

  // Murder Mystery Game Events
  socket.on('mm:joinGame', () => {
    let gameRoom = findAvailableMurderMysteryRoom();
    
    if (!gameRoom) {
      const gameId = uuidv4();
      gameRoom = new MurderMysteryGame(gameId);
      gameRooms.set(gameId, gameRoom);
    }
    
    gameRoom.addPlayer(socket.id, socket);
    userSessions.get(socket.id).currentGame = gameRoom.gameId;
    
    // Join socket room for real-time updates
    socket.join(gameRoom.gameId);
    
    // Send updated game state to all players in the room
    io.to(gameRoom.gameId).emit('mm:gameState', gameRoom.getGameState());
  });

  socket.on('mm:leaveGame', () => {
    const userSession = userSessions.get(socket.id);
    if (userSession.currentGame) {
      const gameRoom = gameRooms.get(userSession.currentGame);
      if (gameRoom && gameRoom.gameType === 'murdermystery') {
        gameRoom.removePlayer(socket.id);
        socket.leave(gameRoom.gameId);
        
        if (gameRoom.players.length === 0) {
          gameRooms.delete(gameRoom.gameId);
        } else {
          io.to(gameRoom.gameId).emit('mm:gameState', gameRoom.getGameState());
        }
      }
      userSession.currentGame = null;
    }
  });

  socket.on('mm:eliminatePlayer', (data) => {
    const game = gameRooms.get(data.gameId);
    if (game && game.gameType === 'murdermystery') {
      const result = game.eliminatePlayer(socket.id, data.playerId);
      if (result.success) {
        io.to(game.gameId).emit('mm:playerEliminated', {
          players: game.getAlivePlayers(),
          eliminated: data.playerId
        });
        
        if (result.gameOver) {
          io.to(game.gameId).emit('mm:gameOver', result);
          // Update stats for all players
          game.players.forEach(player => {
            updateUserStats(player.id, player.won, player.winnings);
          });
          gameRooms.delete(data.gameId);
        }
      }
    }
  });

  socket.on('mm:accusePlayer', (data) => {
    const game = gameRooms.get(data.gameId);
    if (game && game.gameType === 'murdermystery') {
      const result = game.accusePlayer(socket.id, data.playerId);
      io.to(game.gameId).emit('mm:accusation', result);
      
      if (result.gameOver) {
        io.to(game.gameId).emit('mm:gameOver', result);
        // Update stats for all players
        game.players.forEach(player => {
          updateUserStats(player.id, player.won, player.winnings);
        });
        gameRooms.delete(data.gameId);
      }
    }
  });

  // Limbo Game Events
  socket.on('limbo:play', (data) => {
    const user = userSessions.get(socket.id);
    const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
    const game = new LimboGame(socket.id, data, rng);
    const result = game.play();
    result.fair = fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1);
    
    updateUserStats(socket.id, result.won, result.winnings);
    socket.emit('limbo:result', result);
    
    // Check for big win
    if (result.won && result.winnings >= 100) {
      addBigWin({
        username: user.username,
        userAvatar: user.avatar,
        game: 'limbo',
        amount: result.winnings,
        timestamp: Date.now()
      });
    }
  });

  // Crash Game Events
  socket.on('crash:join', (data) => {
    const user = userSessions.get(socket.id);
    const rng = createRNG(provablyFair.serverSeed, user.fairness.clientSeed, user.fairness.nonce++);
    const game = new CrashGame(socket.id, data, rng);
    const gameId = uuidv4();
    gameRooms.set(gameId, game);
    
    userSessions.get(socket.id).currentGame = gameId;
    
    socket.emit('crash:joined', {
      gameId,
      multiplier: 1.00,
      status: 'active'
    });
    
    // Start the crash game progression
    const gameInterval = setInterval(() => {
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) {
        clearInterval(gameInterval);
        return;
      }
      
      const result = gameRoom.tick();
      
      if (result.crashed) {
        updateUserStats(socket.id, false, 0);
        socket.emit('crash:crashed', {
          crashMultiplier: result.crashMultiplier,
          fair: fairMeta(provablyFair.serverSeedHash, user.fairness.clientSeed, user.fairness.nonce - 1)
        });
        gameRooms.delete(gameId);
        userSessions.get(socket.id).currentGame = null;
        clearInterval(gameInterval);
      } else {
        socket.emit('crash:multiplier', { multiplier: result.multiplier });
      }
    }, 100);
  });

  socket.on('crash:cashOut', () => {
    const userSession = userSessions.get(socket.id);
    const game = gameRooms.get(userSession.currentGame);
    
    if (game && game.playerId === socket.id) {
      const result = game.cashOut();
      updateUserStats(socket.id, true, result.winnings);
      
      // Check for big win
      if (result.winnings >= 100) {
        addBigWin({
          username: userSessions.get(socket.id)?.username,
          userAvatar: userSessions.get(socket.id)?.avatar,
          game: 'crash',
          amount: result.winnings,
          timestamp: Date.now()
        });
      }
      
      socket.emit('crash:cashedOut', {
        winnings: result.winnings,
        multiplier: result.multiplier,
        fair: fairMeta(provablyFair.serverSeedHash, userSessions.get(socket.id).fairness.clientSeed, userSessions.get(socket.id).fairness.nonce - 1)
      });
      
      gameRooms.delete(userSession.currentGame);
      userSessions.get(socket.id).currentGame = null;
    }
  });

  // Live Feed handlers
  socket.on('get-recent-wins', () => {
    socket.emit('recent-wins', bigWins.slice(0, 10));
  });

  // Referral system handlers
  socket.on('get-referral-info', () => {
    const userSession = userSessions.get(socket.id);
    if (!userSession?.username) return;
    
    const userId = socket.id;
    let code = '';
    let stats = { count: 0, earnings: 0 };
    
    // Find existing code
    for (const [codeStr, data] of referralCodes) {
      if (data.userId === userId) {
        code = codeStr;
        break;
      }
    }
    
    // Get stats
    if (referralStats.has(userId)) {
      stats = referralStats.get(userId);
    }
    
    socket.emit('referral-info', { code, stats });
  });

  socket.on('generate-referral-code', () => {
    const userSession = userSessions.get(socket.id);
    if (!userSession?.username) return;
    
    const code = generateReferralCode();
    referralCodes.set(code, {
      userId: socket.id,
      username: userSession.username,
      createdAt: Date.now()
    });
    
    socket.emit('referral-info', { 
      code, 
      stats: referralStats.get(socket.id) || { count: 0, earnings: 0 }
    });
  });

  socket.on('use-referral-code', (code) => {
    const userSession = userSessions.get(socket.id);
    if (!userSession?.username || !referralCodes.has(code)) return;
    
    const referralData = referralCodes.get(code);
    if (referralData.userId === socket.id) return; // Can't refer yourself
    
    // Update referrer stats
    const referrerStats = referralStats.get(referralData.userId) || { count: 0, earnings: 0 };
    referrerStats.count += 1;
    referralStats.set(referralData.userId, referrerStats);
    
    // Give bonus to new user (can add balance logic here)
    socket.emit('referral-used', { success: true, bonus: 10 });
    
    // Notify referrer if online
    const referrerSocket = [...userSessions.entries()].find(([id, session]) => 
      session.username === referralData.username
    );
    if (referrerSocket) {
      io.to(referrerSocket[0]).emit('referral-info', { 
        code, 
        stats: referrerStats
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    const userSession = userSessions.get(socket.id);
    if (userSession && userSession.currentGame) {
      const gameRoom = gameRooms.get(userSession.currentGame);
      if (gameRoom) {
        // Handle game-specific cleanup
        if (gameRoom.gameType === 'murdermystery') {
          gameRoom.removePlayer(socket.id);
          if (gameRoom.players.length === 0) {
            gameRooms.delete(gameRoom.gameId);
          } else {
            io.to(gameRoom.gameId).emit('mm:gameState', gameRoom.getGameState());
          }
        } else {
          // For single-player games, just remove the game
          gameRooms.delete(userSession.currentGame);
        }
      }
    }
    
    userSessions.delete(socket.id);
    io.emit('stats:update', { activeConnections: userSessions.size });
  });
});

// Helper functions
function updateUserStats(userId, won, winnings = 0) {
  const userSession = userSessions.get(userId);
  if (userSession) {
    userSession.stats.gamesPlayed++;
    if (won) {
      userSession.stats.wins++;
      userSession.stats.totalWinnings += winnings;
    } else {
      userSession.stats.losses++;
    }
    // emit incremental leaderboard update
    io.emit('leaderboard:update', {
      id: userId,
      totalWinnings: userSession.stats.totalWinnings,
      gamesPlayed: userSession.stats.gamesPlayed,
      wins: userSession.stats.wins,
    });
  }
}

function addBigWin(winData) {
  bigWins.unshift({ ...winData, id: uuidv4() });
  bigWins.splice(100); // Keep only last 100 wins
  io.emit('big-win', winData);
}

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function findAvailableMurderMysteryRoom() {
  for (const [gameId, room] of gameRooms) {
    if (room.gameType === 'murdermystery' && room.canJoin()) {
      return room;
    }
  }
  return null;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// Helpers
function sanitizeMessage(text) {
  const trimmed = text.trim().slice(0, 300);
  if (!trimmed) return '';
  // very basic profanity mask and URL block for demo
  const banned = /(fuck|shit|bitch|http\:\/\/|https\:\/\/)/gi;
  return trimmed.replace(banned, '***');
}
