import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, DollarSign, Star } from 'lucide-react';

// Skeleton loaders for different components
export const GameCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 h-full animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="w-20 h-20 bg-gray-700/50 rounded-2xl"></div>
      <div className="flex gap-2">
        <div className="w-16 h-6 bg-gray-700/50 rounded-full"></div>
        <div className="w-12 h-6 bg-gray-700/50 rounded-full"></div>
      </div>
    </div>
    
    <div className="space-y-3 mb-6">
      <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
      <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
    </div>
    
    <div className="flex justify-between items-center mb-6 py-3 border-t border-gray-700/50">
      <div className="h-4 bg-gray-700/50 rounded w-20"></div>
      <div className="h-4 bg-gray-700/50 rounded w-16"></div>
    </div>
    
    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
  </div>
);

export const LiveFeedSkeleton = () => (
  <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-6 h-6 bg-gray-700/50 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-700/50 rounded w-32 animate-pulse"></div>
    </div>
    
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700/50 rounded w-24"></div>
              <div className="h-3 bg-gray-700/50 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-700/50 rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

// Advanced loading animations
export const CasinoLoader = () => (
  <motion.div
    className="flex flex-col items-center justify-center min-h-[200px] text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="relative w-16 h-16 mb-4"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full"></div>
      <motion.div
        className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.5)',
            '0 0 40px rgba(147, 51, 234, 0.7)',
            '0 0 20px rgba(59, 130, 246, 0.5)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <DollarSign className="w-6 h-6 text-white" />
      </motion.div>
    </motion.div>
    
    <motion.h3
      className="text-xl font-bold text-white mb-2"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      Loading Game...
    </motion.h3>
    
    <motion.p
      className="text-gray-400 text-sm"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      Preparing your gaming experience
    </motion.p>
  </motion.div>
);

export const SlotMachineLoader = () => {
  const symbols = ['🎰', '💎', '⭐', '🍒', '🔔'];
  
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[200px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex gap-2 mb-6">
        {symbols.map((symbol, index) => (
          <motion.div
            key={index}
            className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/30 rounded-lg flex items-center justify-center text-2xl shadow-lg"
            animate={{
              y: [-20, 20, -20],
              rotateY: [0, 180, 360]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>
      
      <motion.div
        className="text-yellow-400 font-bold text-lg mb-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        SPINNING...
      </motion.div>
      
      <div className="text-gray-400 text-sm">Good luck!</div>
    </motion.div>
  );
};

export const DiceRollLoader = () => (
  <motion.div
    className="flex flex-col items-center justify-center min-h-[200px]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400/50 rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-xl mb-6"
      animate={{
        rotateX: [0, 360],
        rotateY: [0, 360],
        rotateZ: [0, 180],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      🎲
    </motion.div>
    
    <motion.div
      className="text-blue-400 font-bold text-lg mb-2"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Rolling Dice...
    </motion.div>
    
    <div className="text-gray-400 text-sm">Calculating your luck</div>
  </motion.div>
);

// Page transition component
export const PageTransition = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered children animation
export const StaggerContainer = ({ children, className = "", delay = 0.1 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = "" }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Success/Error states
export const SuccessState = ({ title, message, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        ✓
      </motion.div>
    </motion.div>
    
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-6">{message}</p>
    
    {action && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {action}
      </motion.div>
    )}
  </motion.div>
);

export const ErrorState = ({ title, message, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        ✕
      </motion.div>
    </motion.div>
    
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-6">{message}</p>
    
    {action && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {action}
      </motion.div>
    )}
  </motion.div>
);

export default {
  GameCardSkeleton,
  LiveFeedSkeleton,
  CasinoLoader,
  SlotMachineLoader,
  DiceRollLoader,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  SuccessState,
  ErrorState
};