class CrashGame {
  constructor(playerId, { betAmount }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.currentMultiplier = 1.00;
    this.crashed = false;
    this.cashedOut = false;
    this.gameType = 'crash';
    this.rng = rng || Math.random;
    this.crashPoint = this.generateCrashPoint();
  }

  generateCrashPoint() {
    // Generate crash point between 1.01 and 50.00
    // Higher chance for lower multipliers
    const random = this.rng();
    if (random < 0.4) return 1.01 + this.rng() * 1.99; // 1.01-3.00 (40% chance)
    if (random < 0.7) return 3.00 + this.rng() * 7.00; // 3.00-10.00 (30% chance)
    if (random < 0.9) return 10.00 + this.rng() * 15.00; // 10.00-25.00 (20% chance)
    return 25.00 + this.rng() * 25.00; // 25.00-50.00 (10% chance)
  }

  tick() {
    if (this.crashed || this.cashedOut) {
      return { crashed: true, multiplier: this.currentMultiplier, crashMultiplier: this.crashPoint };
    }

    this.currentMultiplier += 0.01;
    this.currentMultiplier = Math.round(this.currentMultiplier * 100) / 100;

    if (this.currentMultiplier >= this.crashPoint) {
      this.crashed = true;
      return { crashed: true, multiplier: this.currentMultiplier, crashMultiplier: this.crashPoint };
    }

    return { crashed: false, multiplier: this.currentMultiplier };
  }

  cashOut() {
    if (!this.crashed && !this.cashedOut) {
      this.cashedOut = true;
      const winnings = this.betAmount * this.currentMultiplier;
      
      return {
        won: true,
        winnings,
        multiplier: this.currentMultiplier,
        betAmount: this.betAmount
      };
    }
    return {
      won: false,
      winnings: 0,
      multiplier: this.currentMultiplier,
      betAmount: this.betAmount
    };
  }

  getResult() {
    return {
      won: this.cashedOut,
      winnings: this.cashedOut ? this.betAmount * this.currentMultiplier : 0,
      multiplier: this.currentMultiplier,
      crashed: this.crashed,
      crashPoint: this.crashPoint,
      betAmount: this.betAmount
    };
  }
}

module.exports = CrashGame;
