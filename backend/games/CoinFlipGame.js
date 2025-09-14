class CoinFlipGame {
  constructor(playerId, { betAmount, selectedSide }, rng) {
    this.playerId = playerId;
    this.betAmount = betAmount;
    this.selectedSide = selectedSide;
    this.gameType = 'coinflip';
    this.rng = rng || Math.random;
  }

  flip() {
    const result = (this.rng() > 0.5) ? 'heads' : 'tails';
    const won = result === this.selectedSide;
    const winnings = won ? this.betAmount * 2 : 0;

    return {
      result,
      selectedSide: this.selectedSide,
      won,
      winnings,
      betAmount: this.betAmount
    };
  }
}

module.exports = CoinFlipGame;
