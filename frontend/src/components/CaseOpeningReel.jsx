import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Crown } from 'lucide-react';

const CaseOpeningReel = ({ 
  isOpening = false, 
  onComplete = () => {},
  caseItems = [],
  winningIndex = 0,
  duration = 4000 
}) => {
  const [items, setItems] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wonItem, setWonItem] = useState(null);
  const reelRef = useRef(null);

  // Generate items for the reel with duplicates for seamless scrolling
  useEffect(() => {
    if (caseItems.length === 0) return;
    
    // Create a long array of items with the winning item at the correct position
    const totalItems = 50; // Total items in the reel
    const centerPosition = 25; // Where the winning item should stop
    const generatedItems = [];
    
    for (let i = 0; i < totalItems; i++) {
      if (i === centerPosition) {
        // Place the winning item at the center position
        generatedItems.push({
          ...caseItems[winningIndex],
          id: `winning-${i}`,
          isWinning: true
        });
      } else {
        // Fill with random items from the case
        const randomItem = caseItems[Math.floor(Math.random() * caseItems.length)];
        generatedItems.push({
          ...randomItem,
          id: `item-${i}`,
          isWinning: false
        });
      }
    }
    
    setItems(generatedItems);
  }, [caseItems, winningIndex]);

  // Start the opening animation
  useEffect(() => {
    if (isOpening && items.length > 0) {
      setIsAnimating(true);
      setWonItem(null);
      
      // Calculate the distance to scroll to center the winning item
      const itemWidth = 120; // Width of each item including margin
      const centerPosition = 25;
      const scrollDistance = centerPosition * itemWidth;
      
      setTimeout(() => {
        setIsAnimating(false);
        setWonItem(items.find(item => item.isWinning));
        onComplete(items.find(item => item.isWinning));
      }, duration);
    }
  }, [isOpening, items, duration, onComplete]);

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600',
      mythical: 'from-red-400 to-red-600'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityIcon = (rarity) => {
    const icons = {
      common: Star,
      rare: Zap,
      epic: Trophy,
      legendary: Crown,
      mythical: Crown
    };
    return icons[rarity] || Star;
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Spotlight indicator - shows where item will stop */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full z-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-yellow-500/30 via-yellow-500/10 to-yellow-500/30 border-x-2 border-yellow-500/50" />
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500" />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rotate-180">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500" />
        </div>
      </div>

      {/* Reel container */}
      <div className="relative h-full overflow-hidden">
        <motion.div
          ref={reelRef}
          className="flex items-center h-full"
          initial={{ x: 0 }}
          animate={{
            x: isAnimating ? [0, -3000, -3000 + (25 * 120)] : 0
          }}
          transition={{
            duration: duration / 1000,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for realistic deceleration
            times: [0, 0.7, 1] // Spend 70% of time spinning fast, 30% decelerating
          }}
          style={{ paddingLeft: '50%' }} // Start with first item centered
        >
          {items.map((item, index) => {
            const Icon = getRarityIcon(item.rarity);
            
            return (
              <motion.div
                key={item.id}
                className={`flex-shrink-0 w-28 h-32 mx-2 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-lg border-2 ${
                  item.isWinning ? 'border-yellow-400' : 'border-transparent'
                } shadow-lg overflow-hidden relative`}
                whileHover={{ scale: 1.05 }}
              >
                {/* Item image placeholder */}
                <div className="w-full h-20 bg-slate-700/30 flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <Icon className="w-12 h-12 text-white/80" />
                  )}
                </div>
                
                {/* Item info */}
                <div className="p-2 text-center">
                  <div className="text-white text-xs font-bold truncate">
                    {item.name}
                  </div>
                  <div className="text-yellow-300 text-xs font-semibold">
                    ${item.value}
                  </div>
                </div>

                {/* Winning item glow effect */}
                {item.isWinning && isAnimating && (
                  <motion.div
                    className="absolute inset-0 bg-yellow-400/20 rounded-lg"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Winning item reveal overlay */}
      <AnimatePresence>
        {wonItem && !isAnimating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-30"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`bg-gradient-to-br ${getRarityColor(wonItem.rarity)} p-8 rounded-2xl border-4 border-yellow-400 text-center max-w-md mx-4`}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">🎉 YOU WON! 🎉</h2>
              <h3 className="text-xl font-bold text-white mb-2">{wonItem.name}</h3>
              <p className="text-lg text-yellow-300 mb-4 capitalize">{wonItem.rarity} Item</p>
              <div className="text-4xl font-bold text-yellow-300 mb-6">${wonItem.value}</div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWonItem(null)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-lg transition-colors"
              >
                Claim Prize
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status text */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        {isAnimating ? 'Opening case...' : wonItem ? 'Case opened!' : 'Ready to open'}
      </div>
    </div>
  );
};

export default CaseOpeningReel;