class UpgraderGame {
  constructor(playerId, { betAmount }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.currentLevel = 1;
    this.gameType = 'upgrader';
    this.rng = rng || Math.random;
    
    this.successChances = {
      1: 90, 2: 80, 3: 70, 4: 60, 5: 50,
      6: 40, 7: 30, 8: 20, 9: 10, 10: 5
    };
    
    this.multipliers = {
      1: 1.1, 2: 1.2, 3: 1.4, 4: 1.6, 5: 2.0,
      6: 2.5, 7: 3.0, 8: 4.0, 9: 5.0, 10: 10.0
    };
  }

  tryUpgrade() {
    if (this.currentLevel >= 10) {
      return {
        success: false,
        reason: 'Maximum level reached',
        gameOver: false
      };
    }

  const chance = this.successChances[this.currentLevel];
  const success = this.rng() * 100 < chance;

    if (success) {
      this.currentLevel++;
      
      if (this.currentLevel >= 10) {
        // Max level reached, automatically cash out
        const finalMultiplier = this.getCurrentMultiplier();
        const winnings = this.betAmount * finalMultiplier;
        
        return {
          success: true,
          levelUp: true,
          newLevel: this.currentLevel,
          gameOver: true,
          won: true,
          winnings,
          finalMultiplier
        };
      }
      
      return {
        success: true,
        levelUp: true,
        newLevel: this.currentLevel,
        gameOver: false
      };
    } else {
      // Upgrade failed, game over
      return {
        success: false,
        levelUp: false,
        gameOver: true,
        won: false,
        winnings: 0
      };
    }
  }

  cashOut() {
    const multiplier = this.getCurrentMultiplier();
    const winnings = this.betAmount * multiplier;
    
    return {
      won: true,
      winnings,
      level: this.currentLevel,
      multiplier,
      betAmount: this.betAmount
    };
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  getCurrentMultiplier() {
    let totalMultiplier = 1;
    for (let i = 1; i < this.currentLevel; i++) {
      totalMultiplier *= this.multipliers[i];
    }
    return Math.round(totalMultiplier * 100) / 100;
  }

  getSuccessChance() {
    return this.successChances[this.currentLevel] || 0;
  }
}

module.exports = UpgraderGame;
