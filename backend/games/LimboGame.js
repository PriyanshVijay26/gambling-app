class LimboGame {
  constructor(playerId, { betAmount, targetMultiplier }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.targetMultiplier = targetMultiplier;
    this.gameType = 'limbo';
    this.rng = rng || Math.random;
  }

  play() {
    // Generate random multiplier between 1.00 and 10.00
    const randomMultiplier = 1 + (this.rng() * 9);
    const actualMultiplier = Math.round(randomMultiplier * 100) / 100;
    
    const won = actualMultiplier >= this.targetMultiplier;
    const winnings = won ? this.betAmount * this.targetMultiplier : 0;

    return {
      actualMultiplier,
      targetMultiplier: this.targetMultiplier,
      won,
      winnings,
      betAmount: this.betAmount
    };
  }
}

module.exports = LimboGame;
