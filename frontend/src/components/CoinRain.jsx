import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

const CoinRain = ({ isActive, onComplete }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (isActive) {
      const newCoins = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 3,
        rotation: Math.random() * 360,
        size: Math.random() * 0.5 + 0.8
      }));
      setCoins(newCoins);

      const timer = setTimeout(() => {
        setCoins([]);
        if (onComplete) onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              className="absolute text-yellow-400"
              style={{
                left: `${coin.x}%`,
                top: '-10%',
                fontSize: `${coin.size}rem`
              }}
              initial={{ 
                y: -100, 
                rotate: 0,
                opacity: 0 
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: coin.rotation * 4,
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: coin.duration,
                delay: coin.delay,
                ease: "easeIn",
                opacity: {
                  times: [0, 0.1, 0.9, 1],
                  duration: coin.duration
                }
              }}
            >
              <Coins className="w-8 h-8 drop-shadow-lg" />
            </motion.div>
          ))}
          
          {/* Celebration text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-6xl font-bold text-yellow-400 text-center drop-shadow-2xl"
              animate={{
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 20px rgba(250, 204, 21, 0.5)",
                  "0 0 40px rgba(250, 204, 21, 0.8)",
                  "0 0 20px rgba(250, 204, 21, 0.5)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              BIG WIN!
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CoinRain;