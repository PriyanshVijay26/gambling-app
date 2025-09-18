#!/usr/bin/env node

// Simple test script to verify Mines game functionality
const MinesGame = require('./backend/games/MinesGame');
const { createRNG } = require('./backend/utils/fairness');

console.log('🎮 Testing Mines Game Implementation...\n');

// Test 1: Basic game creation
console.log('Test 1: Basic game creation');
try {
  const rng = createRNG('test-server-seed', 'test-client-seed', 1);
  const game = new MinesGame('player1', {
    betAmount: 10,
    mineCount: 3,
    gridSize: 5
  }, rng);
  
  console.log('✅ Game created successfully');
  console.log(`   Grid size: ${game.gridSize}x${game.gridSize} (${game.gridLength} cells)`);
  console.log(`   Mine count: ${game.mineCount}`);
  console.log(`   Bet amount: ${game.betAmount}`);
  console.log(`   Initial multiplier: ${game.getCurrentMultiplier()}`);
  console.log(`   Mines placed at: [${Array.from(game.mines).join(', ')}]`);
} catch (error) {
  console.log('❌ Game creation failed:', error.message);
}

// Test 2: Different grid sizes
console.log('\nTest 2: Different grid sizes');
const gridSizes = [3, 4, 5, 6, 8];
gridSizes.forEach(size => {
  try {
    const rng = createRNG('test-server-seed', 'test-client-seed', 1);
    const game = new MinesGame('player1', {
      betAmount: 10,
      mineCount: Math.min(3, size * size - 1),
      gridSize: size
    }, rng);
    console.log(`✅ ${size}x${size} grid created with ${game.mineCount} mines`);
  } catch (error) {
    console.log(`❌ ${size}x${size} grid failed:`, error.message);
  }
});

// Test 3: Cell revealing
console.log('\nTest 3: Cell revealing');
try {
  const rng = createRNG('test-server-seed', 'test-client-seed', 1);
  const game = new MinesGame('player1', {
    betAmount: 10,
    mineCount: 3,
    gridSize: 5
  }, rng);
  
  console.log('Mines at positions:', Array.from(game.mines));
  
  // Find a safe cell
  let safeCell = 0;
  while (game.mines.has(safeCell)) {
    safeCell++;
  }
  
  console.log(`Revealing safe cell ${safeCell}...`);
  const result = game.revealCell(safeCell);
  console.log('✅ Safe cell revealed:', result);
  console.log(`   New multiplier: ${game.getCurrentMultiplier()}`);
  console.log(`   Revealed count: ${game.getRevealedCount()}`);
  
} catch (error) {
  console.log('❌ Cell revealing failed:', error.message);
}

// Test 4: Mine hit
console.log('\nTest 4: Mine hit');
try {
  const rng = createRNG('test-server-seed', 'test-client-seed', 1);
  const game = new MinesGame('player1', {
    betAmount: 10,
    mineCount: 3,
    gridSize: 5
  }, rng);
  
  const minePosition = Array.from(game.mines)[0];
  console.log(`Revealing mine at position ${minePosition}...`);
  const result = game.revealCell(minePosition);
  console.log('✅ Mine hit detected:', result);
  console.log(`   Game state: ${game.gameState}`);
  
} catch (error) {
  console.log('❌ Mine hit test failed:', error.message);
}

// Test 5: Cash out
console.log('\nTest 5: Cash out');
try {
  const rng = createRNG('test-server-seed', 'test-client-seed', 1);
  const game = new MinesGame('player1', {
    betAmount: 10,
    mineCount: 3,
    gridSize: 5
  }, rng);
  
  // Reveal a few safe cells
  let safeCells = 0;
  for (let i = 0; i < game.gridLength && safeCells < 3; i++) {
    if (!game.mines.has(i)) {
      game.revealCell(i);
      safeCells++;
    }
  }
  
  console.log(`After revealing ${safeCells} safe cells:`);
  console.log(`   Multiplier: ${game.getCurrentMultiplier()}`);
  console.log(`   Potential winnings: ${game.betAmount * game.getCurrentMultiplier()}`);
  
  const cashOutAmount = game.cashOut();
  console.log('✅ Cash out successful:', cashOutAmount);
  console.log(`   Game state: ${game.gameState}`);
  
} catch (error) {
  console.log('❌ Cash out test failed:', error.message);
}

console.log('\n🎮 Mines Game Test Complete!');