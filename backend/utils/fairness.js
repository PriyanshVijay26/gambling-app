const crypto = require('crypto');

function hmacSHA256(key, message) {
  return crypto.createHmac('sha256', key).update(message).digest('hex');
}

function hexToFloat01(hex) {
  // Use first 13 hex chars (~52 bits) to avoid precision issues
  const slice = hex.slice(0, 13);
  const int = parseInt(slice, 16);
  const max = Math.pow(16, slice.length) - 1; // 16^13 - 1
  return int / max; // [0,1)
}

function createRNG(serverSeed, clientSeed, nonce) {
  return function rng(index = 0) {
    const msg = `${clientSeed}:${nonce}:${index}`;
    const hex = hmacSHA256(serverSeed, msg);
    return hexToFloat01(hex);
  };
}

function fairMeta(serverSeedHash, clientSeed, nonce) {
  return { serverSeedHash, clientSeed, nonce };
}

module.exports = { createRNG, fairMeta, hmacSHA256, hexToFloat01 };
