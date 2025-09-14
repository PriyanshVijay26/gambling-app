class TowersGame {
  constructor(playerId, { betAmount, difficulty = 'medium' }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.difficulty = difficulty; // 'easy', 'medium', 'hard'
    this.gameType = 'towers';
    this.rng = rng || Math.random;
    
    this.levels = 8;
    this.blocksPerLevel = this.getDifficultyBlocks();
    this.currentLevel = 0;
    this.gameState = 'playing';
    this.path = [];
    
    // Generate safe paths for each level
    this.safePaths = this.generateSafePaths();
  }

  getDifficultyBlocks() {
    switch (this.difficulty) {
      case 'easy': return 2; // 2 blocks per level, 1 safe
      case 'medium': return 3; // 3 blocks per level, 1 safe  
      case 'hard': return 4; // 4 blocks per level, 1 safe
      default: return 3;
    }
  }

  generateSafePaths() {
    const paths = [];
    for (let level = 0; level < this.levels; level++) {
      paths[level] = Math.floor(this.rng() * this.blocksPerLevel);
    }
    return paths;
  }

  selectBlock(level, blockIndex) {
    if (this.gameState !== 'playing' || level !== this.currentLevel) {
      return { success: false, reason: 'Invalid move' };
    }

    if (blockIndex === this.safePaths[level]) {
      // Correct path
      this.path.push(blockIndex);
      this.currentLevel++;
      
      if (this.currentLevel >= this.levels) {
        // Reached the top!
        this.gameState = 'won';
        const finalMultiplier = this.getCurrentMultiplier();
        const winnings = this.betAmount * finalMultiplier;
        
        return {
          success: true,
          correct: true,
          gameOver: true,
          won: true,
          winnings,
          finalMultiplier,
          level: this.currentLevel
        };
      }
      
      return {
        success: true,
        correct: true,
        gameOver: false,
        level: this.currentLevel,
        multiplier: this.getCurrentMultiplier()
      };
    } else {
      // Wrong path - game over
      this.gameState = 'lost';
      return {
        success: true,
        correct: false,
        gameOver: true,
        won: false,
        winnings: 0,
        correctBlock: this.safePaths[level]
      };
    }
  }

  getCurrentMultiplier() {
    if (this.currentLevel === 0) return 1.0;
    
    const baseMultiplier = this.getBaseMultiplier();
    return Math.pow(baseMultiplier, this.currentLevel);
  }

  getBaseMultiplier() {
    // Higher multiplier for harder difficulties
    switch (this.difficulty) {
      case 'easy': return 1.5; // 2 blocks
      case 'medium': return 2.0; // 3 blocks
      case 'hard': return 2.5; // 4 blocks
      default: return 2.0;
    }
  }

  cashOut() {
    if (this.gameState === 'playing' && this.currentLevel > 0) {
      this.gameState = 'cashedOut';
      const multiplier = this.getCurrentMultiplier();
      return this.betAmount * multiplier;
    }
    return 0;
  }

  getGameState() {
    return {
      currentLevel: this.currentLevel,
      maxLevels: this.levels,
      blocksPerLevel: this.blocksPerLevel,
      multiplier: this.getCurrentMultiplier(),
      gameState: this.gameState,
      path: this.path
    };
  }
}

module.exports = TowersGame;