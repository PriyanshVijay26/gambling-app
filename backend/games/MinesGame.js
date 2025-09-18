class MinesGame {
  constructor(playerId, { betAmount, mineCount, gridSize = 5 }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.gridSize = Math.max(3, Math.min(10, Number(gridSize) || 5));
    this.gridLength = this.gridSize * this.gridSize;
    const maxMines = this.gridLength - 1;
    this.mineCount = Math.max(1, Math.min(maxMines, Number(mineCount) || 3));
    this.grid = Array(this.gridLength).fill('hidden');
    this.rng = rng || Math.random;
    this.mines = this.generateMines();
    this.revealed = 0;
    this.gameState = 'playing';
    this.gameType = 'mines';
  }

  generateMines() {
    console.log(`💣 Starting mine generation for ${this.mineCount} mines in ${this.gridLength} cells`);
    const mines = new Set();
    let attempts = 0;
    const maxAttempts = this.gridLength * 10; // Prevent infinite loops
    
    while (mines.size < this.mineCount && attempts < maxAttempts) {
      try {
        // Use attempts as index to ensure different RNG calls
        const position = Math.floor(this.rng(attempts) * this.gridLength);
        console.log(`🎲 RNG attempt ${attempts + 1}: position ${position}`);
        mines.add(position);
        attempts++;
      } catch (rngError) {
        console.error(`❌ Error in RNG call:`, rngError);
        throw rngError;
      }
    }
    
    if (attempts >= maxAttempts) {
      console.error(`❌ Mine generation failed after ${maxAttempts} attempts`);
      throw new Error(`Failed to generate mines after ${maxAttempts} attempts`);
    }
    
    console.log(`✅ Generated ${mines.size} mines:`, Array.from(mines));
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
      if (this.revealed === this.gridLength - this.mineCount) {
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
    
    // More sophisticated multiplier calculation based on probability
    const safeSpaces = this.gridLength - this.mineCount;
    const remainingSafeSpaces = safeSpaces - this.revealed;
    const remainingTotalSpaces = this.gridLength - this.revealed;
    
    // Calculate probability of hitting a mine on next click
    const mineRisk = this.mineCount / remainingTotalSpaces;
    
    // Base multiplier increases exponentially with mine density
    const mineDensity = this.mineCount / this.gridLength;
    const densityMultiplier = Math.pow(1 + mineDensity * 4, 2); // Exponential growth
    
    // Progressive multiplier increases as you reveal more cells
    const progressMultiplier = Math.pow(1.15, this.revealed);
    
    // Risk bonus for higher mine counts
    const riskBonus = Math.pow(this.mineCount / 3, 1.5); // Bonus scales with mine count
    
    // Final multiplier calculation
    const finalMultiplier = densityMultiplier * progressMultiplier * riskBonus;
    
    // Ensure minimum progression and cap at reasonable max
    const cappedMultiplier = Math.min(Math.max(finalMultiplier, 1.00), 1000.00);
    
    return Math.round(cappedMultiplier * 100) / 100;
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
