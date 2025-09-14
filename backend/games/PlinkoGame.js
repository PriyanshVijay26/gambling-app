class PlinkoGame {
  constructor(playerId, { betAmount, risk = 'medium' }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.risk = risk; // 'low', 'medium', 'high'
    this.gameType = 'plinko';
    this.rng = rng || Math.random;
    this.rows = 16;
    this.buckets = 17;
    
    // Multiplier tables for different risk levels
    this.multipliers = {
      low: [1000, 130, 26, 9, 4, 2, 1.5, 1, 0.5, 1, 1.5, 2, 4, 9, 26, 130, 1000],
      medium: [1000, 120, 18, 8, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 8, 18, 120, 1000],
      high: [1000, 43, 7, 3, 1.5, 1, 0.5, 0.3, 0.2, 0.3, 0.5, 1, 1.5, 3, 7, 43, 1000]
    };
  }

  drop() {
    let position = 8.0; // Start in center (between buckets 8 and 9)

    // Simulate ball bouncing through pegs using indexed RNG per row
    for (let row = 0; row < this.rows; row++) {
      const r = this.rng(row);
      if (r < 0.5) {
        position -= 0.5; // Go left
      } else {
        position += 0.5; // Go right
      }
    }
    
    // Determine final bucket (0-16)
    // Position can range from 0.0 to 16.0, map to buckets 0-16
    const bucket = Math.max(0, Math.min(this.buckets - 1, Math.floor(position)));
    const multiplier = this.multipliers[this.risk][bucket];
    const winnings = this.betAmount * multiplier;
    
    return {
      bucket,
      multiplier,
      winnings,
      risk: this.risk,
      betAmount: this.betAmount,
      won: winnings > this.betAmount
    };
  }
}

module.exports = PlinkoGame;