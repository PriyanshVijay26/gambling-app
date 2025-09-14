class MinesGame {
  constructor(playerId, { betAmount, mineCount }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.mineCount = Math.max(1, Math.min(24, mineCount));
    this.grid = Array(25).fill('hidden');
    this.rng = rng || Math.random;
    this.mines = this.generateMines();
    this.revealed = 0;
    this.gameState = 'playing';
    this.gameType = 'mines';
  }

  generateMines() {
    const mines = new Set();
    while (mines.size < this.mineCount) {
      mines.add(Math.floor(this.rng() * 25));
    }
    return mines;
  }

  revealCell(index) {
    if (this.grid[index] !== 'hidden' || this.gameState !== 'playing') {
      return { success: false };
    }

    if (this.mines.has(index)) {
      this.grid[index] = 'mine';
      this.gameState = 'lost';
      // Reveal all mines
      this.mines.forEach(mineIndex => {
        this.grid[mineIndex] = 'mine';
      });
      return { 
        success: true, 
        mine: true, 
        gameOver: true, 
        won: false, 
        winnings: 0 
      };
    } else {
      this.grid[index] = 'revealed';
      this.revealed++;
      
      // Check if won (all non-mine cells revealed)
      if (this.revealed === 25 - this.mineCount) {
        this.gameState = 'won';
        const winnings = this.betAmount * this.getCurrentMultiplier();
        return { 
          success: true, 
          mine: false, 
          gameOver: true, 
          won: true, 
          winnings 
        };
      }
      
      return { 
        success: true, 
        mine: false, 
        gameOver: false 
      };
    }
  }

  getCurrentMultiplier() {
    if (this.revealed === 0) return 1.00;
    
    // Calculate multiplier based on revealed cells and mine count
    const safeSpaces = 25 - this.mineCount;
    const revealedRatio = this.revealed / safeSpaces;
    const baseMultiplier = 1 + (this.mineCount * 0.1);
    
    return Math.round((baseMultiplier + (revealedRatio * this.mineCount * 0.5)) * 100) / 100;
  }

  cashOut() {
    if (this.gameState === 'playing' && this.revealed > 0) {
      this.gameState = 'cashedOut';
      return this.betAmount * this.getCurrentMultiplier();
    }
    return 0;
  }

  getPublicGrid() {
    return this.grid.map(cell => cell === 'hidden' ? 'hidden' : cell);
  }

  getRevealedCount() {
    return this.revealed;
  }
}

module.exports = MinesGame;
