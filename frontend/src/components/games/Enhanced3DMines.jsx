import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Game3DScene, Particle3DEffect } from '../3d/Game3DComponents';
import { CoinSpinAnimation, WinExplosionAnimation, ImagePreloader } from '../animations/LottieAnimations';
import { useNotification } from '../../context/NotificationContext';
import { useAudio } from '../../context/AudioContext';

const Enhanced3DMines = () => {
  const [gameState, setGameState] = useState('idle');
  const [revealedCells, setRevealedCells] = useState([]);
  const [mines] = useState([3, 7, 15, 22]); // Example mine positions
  const [showWinEffect, setShowWinEffect] = useState(false);
  const [show3DParticles, setShow3DParticles] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const { win, error } = useNotification();
  const { gameAudio } = useAudio();

  // Images to preload
  const gameImages = [
    '/images/diamond.png',
    '/images/mine.png',
    '/images/coins/gold-coin.png',
    '/images/coins/silver-coin.png'
  ];

  const handleCellClick = (index) => {
    if (revealedCells.includes(index) || gameState !== 'playing') return;

    const newRevealed = [...revealedCells, index];
    setRevealedCells(newRevealed);

    if (mines.includes(index)) {
      // Hit a mine
      gameAudio.minesRevealMine();
      error('💣 You hit a mine!');
      setGameState('lost');
    } else {
      // Safe cell
      gameAudio.minesRevealSafe();
      
      // Check for win
      const safeCells = Array.from({length: 25}, (_, i) => i).filter(i => !mines.includes(i));
      const revealedSafeCells = newRevealed.filter(i => !mines.includes(i));
      
      if (revealedSafeCells.length === safeCells.length) {
        // Win!
        setShowWinEffect(true);
        setShow3DParticles(true);
        gameAudio.win(1000);
        win('🎉 Amazing! You cleared all mines!', '$1000');
        setGameState('won');
        
        setTimeout(() => {
          setShowWinEffect(false);
          setShow3DParticles(false);
        }, 5000);
      }
    }
  };

  const startNewGame = () => {
    setGameState('playing');
    setRevealedCells([]);
    setShowWinEffect(false);
    setShow3DParticles(false);
  };

  if (!imagesLoaded) {
    return (
      <ImagePreloader 
        images={gameImages}
        onAllLoaded={() => setImagesLoaded(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* 3D Particle Effects */}
      <Particle3DEffect 
        type="coins"
        count={30}
        active={show3DParticles}
      />
      
      {/* Win Animation Overlay */}
      <WinExplosionAnimation 
        active={showWinEffect}
        winAmount={1000}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header with animated coins */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <CoinSpinAnimation size={60} spinning={gameState === 'playing'} />
            <h1 className="text-4xl font-bold text-white">3D Enhanced Mines</h1>
            <CoinSpinAnimation size={60} spinning={gameState === 'playing'} />
          </div>
          <p className="text-slate-400">Experience the ultimate 3D gaming with real images and animations!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Game Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4">3D Mines Field</h3>
            
            <Game3DScene
              gameType="mines"
              gameData={{
                revealed: revealedCells,
                mines: mines,
                spinning: gameState === 'playing'
              }}
              onInteraction={handleCellClick}
            />
            
            <div className="mt-4 text-center">
              {gameState === 'idle' && (
                <button
                  onClick={startNewGame}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  Start 3D Game
                </button>
              )}
              
              {gameState === 'playing' && (
                <div className="text-green-400 font-semibold">
                  Click cells in the 3D field above!
                </div>
              )}
              
              {(gameState === 'won' || gameState === 'lost') && (
                <button
                  onClick={startNewGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Play Again
                </button>
              )}
            </div>
          </motion.div>

          {/* Game Info & Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Game Stats */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Game Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Game State:</span>
                  <span className={`font-semibold ${
                    gameState === 'playing' ? 'text-blue-400' :
                    gameState === 'won' ? 'text-green-400' :
                    gameState === 'lost' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {gameState.charAt(0).toUpperCase() + gameState.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Cells Revealed:</span>
                  <span className="text-white">{revealedCells.length}/25</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Mines:</span>
                  <span className="text-red-400">{mines.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Safe Cells:</span>
                  <span className="text-green-400">{25 - mines.length}</span>
                </div>
              </div>
            </div>

            {/* 3D Controls */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">3D Controls</h3>
              
              <div className="space-y-3 text-sm text-slate-400">
                <div>🖱️ <strong>Mouse:</strong> Rotate camera view</div>
                <div>🔍 <strong>Scroll:</strong> Zoom in/out</div>
                <div>👆 <strong>Click:</strong> Reveal cells</div>
                <div>✨ <strong>Hover:</strong> Highlight cells</div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                <div className="text-xs text-slate-300">
                  💡 <strong>Tip:</strong> This 3D view uses WebGL and real images for the ultimate gaming experience!
                </div>
              </div>
            </div>

            {/* Visual Effects Toggle */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Visual Effects</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={show3DParticles}
                    onChange={(e) => setShow3DParticles(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                  />
                  <span className="text-white">3D Particle Effects</span>
                </label>
                
                <button
                  onClick={() => {
                    setShowWinEffect(true);
                    setTimeout(() => setShowWinEffect(false), 3000);
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  Test Win Animation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DMines;