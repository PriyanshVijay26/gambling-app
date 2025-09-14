class MurderMysteryGame {
  constructor(gameId) {
    this.gameId = gameId;
    this.gameType = 'murdermystery';
    this.players = [];
    this.gameState = 'waiting'; // waiting, playing, finished
    this.timeLeft = 300; // 5 minutes
    this.roles = ['innocent', 'murderer', 'detective'];
    this.maxPlayers = 8;
    this.minPlayers = 3;
    this.timer = null;
  }

  canJoin() {
    return this.players.length < this.maxPlayers && this.gameState === 'waiting';
  }

  addPlayer(playerId, socket) {
    if (!this.canJoin()) return false;

    const player = {
      id: playerId,
      socket: socket,
      name: `Player ${this.players.length + 1}`,
      alive: true,
      role: null,
      ready: true
    };

    this.players.push(player);

    // Start game if minimum players reached
    if (this.players.length >= this.minPlayers && this.gameState === 'waiting') {
      this.startGame();
    }

    return true;
  }

  removePlayer(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);
      
      // If game is playing and this affects game state, handle accordingly
      if (this.gameState === 'playing') {
        this.checkGameEnd();
      }
      
      // If not enough players, reset to waiting
      if (this.players.length < this.minPlayers) {
        this.resetGame();
      }
    }
  }

  startGame() {
    if (this.players.length < this.minPlayers) return;

    this.gameState = 'playing';
    this.assignRoles();
    this.startTimer();

    // Notify players of their roles
    this.players.forEach(player => {
      player.socket.emit('mm:roleAssigned', { role: player.role });
    });
  }

  assignRoles() {
    const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
    
    // Assign one murderer
    shuffledPlayers[0].role = 'murderer';
    
    // Assign one detective if 4+ players
    if (shuffledPlayers.length >= 4) {
      shuffledPlayers[1].role = 'detective';
    }
    
    // Rest are innocents
    for (let i = (shuffledPlayers.length >= 4 ? 2 : 1); i < shuffledPlayers.length; i++) {
      shuffledPlayers[i].role = 'innocent';
    }
  }

  startTimer() {
    this.timeLeft = 300; // 5 minutes
    this.timer = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        this.endGame('innocents');
      }
    }, 1000);
  }

  eliminatePlayer(murdererId, targetId) {
    const murderer = this.players.find(p => p.id === murdererId);
    const target = this.players.find(p => p.id === targetId);

    if (!murderer || !target || murderer.role !== 'murderer' || !target.alive) {
      return { success: false };
    }

    target.alive = false;
    
    const result = this.checkGameEnd();
    return { 
      success: true, 
      eliminated: targetId,
      gameOver: result.gameOver,
      winner: result.winner
    };
  }

  accusePlayer(detectiveId, suspectId) {
    const detective = this.players.find(p => p.id === detectiveId);
    const suspect = this.players.find(p => p.id === suspectId);

    if (!detective || !suspect || detective.role !== 'detective' || !suspect.alive) {
      return { success: false };
    }

    if (suspect.role === 'murderer') {
      // Correct accusation - innocents win
      return {
        success: true,
        correct: true,
        accusedPlayer: suspectId,
        gameOver: true,
        winner: 'innocents'
      };
    } else {
      // Wrong accusation - detective is eliminated
      detective.alive = false;
      
      const result = this.checkGameEnd();
      return {
        success: true,
        correct: false,
        accusedPlayer: suspectId,
        detectiveEliminated: detectiveId,
        gameOver: result.gameOver,
        winner: result.winner
      };
    }
  }

  checkGameEnd() {
    const alivePlayers = this.players.filter(p => p.alive);
    const aliveMurderers = alivePlayers.filter(p => p.role === 'murderer');
    const aliveInnocents = alivePlayers.filter(p => p.role === 'innocent' || p.role === 'detective');

    if (aliveMurderers.length === 0) {
      this.endGame('innocents');
      return { gameOver: true, winner: 'innocents' };
    }

    if (aliveInnocents.length <= aliveMurderers.length) {
      this.endGame('murderers');
      return { gameOver: true, winner: 'murderers' };
    }

    return { gameOver: false };
  }

  endGame(winner) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.gameState = 'finished';
    
    // Calculate winnings (basic implementation)
    const baseWinnings = 100;
    this.players.forEach(player => {
      if (winner === 'innocents' && (player.role === 'innocent' || player.role === 'detective')) {
        player.won = true;
        player.winnings = baseWinnings;
      } else if (winner === 'murderers' && player.role === 'murderer') {
        player.won = true;
        player.winnings = baseWinnings * 2; // Murderer gets more for winning
      } else {
        player.won = false;
        player.winnings = 0;
      }
    });
  }

  resetGame() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.gameState = 'waiting';
    this.timeLeft = 300;
    this.players.forEach(player => {
      player.alive = true;
      player.role = null;
      player.ready = true;
    });
  }

  getGameState() {
    return {
      gameId: this.gameId,
      state: this.gameState,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        alive: p.alive,
        ready: p.ready,
        isUser: false // This will be set by the client
      })),
      timeLeft: this.timeLeft,
      maxPlayers: this.maxPlayers,
      minPlayers: this.minPlayers
    };
  }

  getAlivePlayers() {
    return this.players.filter(p => p.alive).map(p => ({
      id: p.id,
      name: p.name,
      alive: p.alive
    }));
  }
}

module.exports = MurderMysteryGame;
