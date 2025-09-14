class DiceGame {
  constructor(playerId, { betAmount, target, rollOver }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.target = Math.max(0.01, Math.min(99.99, target)); // 0.01-99.99
    this.rollOver = rollOver; // true = roll over target, false = roll under
    this.gameType = 'dice';
    this.rng = rng || Math.random;
  }

  roll() {
    // Generate random number 0.00-99.99
    const roll = this.rng() * 100;
    const actualRoll = Math.round(roll * 100) / 100;
    
    let won;
    if (this.rollOver) {
      won = actualRoll > this.target;
    } else {
      won = actualRoll < this.target;
    }

    // Calculate payout based on win chance
    const winChance = this.rollOver ? (100 - this.target) / 100 : this.target / 100;
    const multiplier = 0.99 / winChance; // 1% house edge
    const winnings = won ? this.betAmount * multiplier : 0;

    return {
      actualRoll,
      target: this.target,
      rollOver: this.rollOver,
      won,
      winnings,
      multiplier: multiplier.toFixed(4),
      winChance: (winChance * 100).toFixed(2),
      betAmount: this.betAmount
    };
  }
}

module.exports = DiceGame;