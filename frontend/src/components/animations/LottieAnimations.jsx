import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Since we can't install lottie-react yet, here's a manual implementation
// that works with Lottie JSON files exported from After Effects

export const LottieAnimation = ({ 
  animationData, 
  width = 300, 
  height = 300, 
  autoplay = true,
  loop = true,
  onComplete = () => {},
  className = ''
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!animationData || !containerRef.current) return;

    // Load Lottie library dynamically
    const loadLottie = async () => {
      try {
        // For now, we'll use a simple canvas-based animation
        // In production, you'd load the actual Lottie library
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.className = className;
        
        containerRef.current.appendChild(canvas);
        
        // Simple animation simulation
        const ctx = canvas.getContext('2d');
        let frame = 0;
        const totalFrames = 60;
        
        const animate = () => {
          ctx.clearRect(0, 0, width, height);
          
          // Example: Spinning coin animation
          const centerX = width / 2;
          const centerY = height / 2;
          const radius = Math.min(width, height) / 4;
          
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate((frame / totalFrames) * Math.PI * 2);
          
          // Draw coin
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Add shine effect
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.ellipse(-radius/3, -radius/3, radius/3, radius/6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
          
          frame++;
          if (frame >= totalFrames) {
            if (loop) {
              frame = 0;
            } else {
              onComplete();
              return;
            }
          }
          
          if (autoplay) {
            requestAnimationFrame(animate);
          }
        };
        
        if (autoplay) {
          animate();
        }
        
        animationRef.current = { animate, canvas };
        
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    loadLottie();

    return () => {
      if (animationRef.current?.canvas) {
        containerRef.current?.removeChild(animationRef.current.canvas);
      }
    };
  }, [animationData, width, height, autoplay, loop, onComplete, className]);

  return <div ref={containerRef} style={{ width, height }} />;
};

// Pre-built animation components
export const CoinSpinAnimation = ({ size = 100, spinning = true }) => {
  return (
    <motion.div
      animate={spinning ? { rotateY: 360 } : {}}
      transition={{ duration: 1, repeat: spinning ? Infinity : 0, ease: "linear" }}
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      <div 
        className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg"
        style={{ width: size, height: size }}
      >
        <span className="text-white font-bold" style={{ fontSize: size / 4 }}>$</span>
      </div>
    </motion.div>
  );
};

export const DiceRollAnimation = ({ rolling = false, result = 1 }) => {
  return (
    <motion.div
      animate={rolling ? { 
        rotateX: [0, 360, 720],
        rotateY: [0, 360, 720],
        rotateZ: [0, 180, 360]
      } : {}}
      transition={{ duration: 2, ease: "easeOut" }}
      className="w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-lg"
    >
      <div className="text-2xl font-bold text-gray-800">{result}</div>
    </motion.div>
  );
};

export const CardFlipAnimation = ({ flipping = false, frontImage, backImage }) => {
  return (
    <motion.div
      className="relative w-24 h-36"
      animate={flipping ? { rotateY: 180 } : {}}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Front */}
      <div 
        className="absolute inset-0 w-full h-full rounded-lg shadow-lg"
        style={{ 
          backfaceVisibility: "hidden",
          backgroundImage: frontImage ? `url(${frontImage})` : undefined,
          backgroundSize: 'cover',
          backgroundColor: frontImage ? 'transparent' : '#1e40af'
        }}
      >
        {!frontImage && (
          <div className="flex items-center justify-center h-full text-white text-lg font-bold">
            ?
          </div>
        )}
      </div>
      
      {/* Back */}
      <div 
        className="absolute inset-0 w-full h-full rounded-lg shadow-lg"
        style={{ 
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          backgroundImage: backImage ? `url(${backImage})` : undefined,
          backgroundSize: 'cover',
          backgroundColor: backImage ? 'transparent' : '#dc2626'
        }}
      >
        {!backImage && (
          <div className="flex items-center justify-center h-full text-white text-lg font-bold">
            ♠
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const SlotMachineAnimation = ({ spinning = false, symbols = ['🍒', '🍋', '🔔'] }) => {
  return (
    <div className="flex gap-2">
      {symbols.map((symbol, index) => (
        <motion.div
          key={index}
          className="w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-lg"
          animate={spinning ? { y: [-20, 20, -20] } : {}}
          transition={{ 
            duration: 0.5,
            repeat: spinning ? Infinity : 0,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        >
          <span className="text-2xl">{symbol}</span>
        </motion.div>
      ))}
    </div>
  );
};

export const WinExplosionAnimation = ({ active = false, winAmount = 0 }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={active ? { 
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1],
        rotate: [0, 10, -10, 0]
      } : { scale: 0, opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <div className="text-center">
        <motion.div
          animate={active ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
          className="text-6xl font-bold text-yellow-400 mb-4"
        >
          🎉 WIN! 🎉
        </motion.div>
        <motion.div
          animate={active ? { y: [0, -10, 0] } : {}}
          transition={{ duration: 1, repeat: active ? Infinity : 0 }}
          className="text-4xl font-bold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 rounded-full"
        >
          ${winAmount}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Preloader for images
export const ImagePreloader = ({ images = [], onAllLoaded = () => {} }) => {
  const [loadedCount, setLoadedCount] = React.useState(0);
  
  React.useEffect(() => {
    if (images.length === 0) {
      onAllLoaded();
      return;
    }

    let loaded = 0;
    const imagePromises = images.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          setLoadedCount(loaded);
          if (loaded === images.length) {
            onAllLoaded();
          }
          resolve(img);
        };
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.allSettled(imagePromises);
  }, [images, onAllLoaded]);

  const progress = images.length > 0 ? (loadedCount / images.length) * 100 : 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-white text-xl mb-4">Loading Assets...</div>
        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-white text-sm mt-2">{Math.round(progress)}%</div>
      </div>
    </div>
  );
};