import crypto from 'crypto-js';

export function hmacSHA256(key, message) {
  return crypto.HmacSHA256(message, key).toString(crypto.enc.Hex);
}

export function hexToFloat01(hex) {
  const slice = hex.slice(0, 13);
  const int = parseInt(slice, 16);
  const max = Math.pow(16, slice.length) - 1;
  return int / max;
}

export function rngFactory(serverSeed, clientSeed, nonce) {
  return (index = 0) => {
    const msg = `${clientSeed}:${nonce}:${index}`;
    const hex = hmacSHA256(serverSeed, msg);
    return hexToFloat01(hex);
  };
}

export function verifyCoinFlip({ serverSeed, clientSeed, nonce }) {
  const rng = rngFactory(serverSeed, clientSeed, nonce);
  return rng() > 0.5 ? 'heads' : 'tails';
}

export function verifyMines({ serverSeed, clientSeed, nonce, mineCount, gridSize = 5 }) {
  const rng = rngFactory(serverSeed, clientSeed, nonce);
  const mines = new Set();
  const gridLength = gridSize * gridSize;
  while (mines.size < mineCount) {
    mines.add(Math.floor(rng(mines.size) * gridLength));
  }
  return Array.from(mines);
}
