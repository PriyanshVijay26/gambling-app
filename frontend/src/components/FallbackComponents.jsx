import React from 'react';
import { motion } from 'framer-motion';
import { Box, AlertTriangle, Settings } from 'lucide-react';

// 2D CSS-based case component for fallback
export const FallbackCase = ({ 
  caseType = 'legendary',
  isOpening = false,
  glowIntensity = 1.0 
}) => {
  const caseConfigs = {
    common: {
      gradient: 'from-gray-600 to-gray-800',
      glow: 'shadow-gray-500/50',
      border: 'border-gray-500'
    },
    rare: {
      gradient: 'from-blue-500 to-blue-700',
      glow: 'shadow-blue-500/50',
      border: 'border-blue-400'
    },
    epic: {
      gradient: 'from-purple-500 to-purple-700',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-400'
    },
    legendary: {
      gradient: 'from-yellow-500 to-yellow-700',
      glow: 'shadow-yellow-500/50',
      border: 'border-yellow-400'
    },
    mythical: {
      gradient: 'from-red-500 to-red-700',
      glow: 'shadow-red-500/50',
      border: 'border-red-400'
    }
  };
  
  const config = caseConfigs[caseType] || caseConfigs.common;
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ 
          rotateY: isOpening ? [0, 180, 360] : [0, 360],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: isOpening ? 3 : 4,
          repeat: isOpening ? 0 : Infinity,
          ease: "easeInOut"
        }}
        className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-lg border-2 ${config.border} ${config.glow} shadow-lg`}
        style={{
          filter: `drop-shadow(0 0 ${glowIntensity * 10}px currentColor)`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Box className="w-8 h-8 text-white" />
        </div>
      </motion.div>
    </div>
  );
};

// WebGL not supported message
export const WebGLNotSupported = ({ onEnableWebGL }) => (
  <div className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg flex flex-col items-center justify-center p-4 text-center">
    <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
    <h3 className="text-white font-semibold mb-1">3D Graphics Unavailable</h3>
    <p className="text-slate-400 text-sm mb-3">
      Your system doesn't support WebGL or it's disabled for performance reasons.
    </p>
    <button
      onClick={onEnableWebGL}
      className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
    >
      <Settings className="w-4 h-4" />
      Try Enable 3D
    </button>
  </div>
);

// 2D fallback for the case gallery
export const FallbackCaseGallery = ({ cases = [], onCaseSelect = () => {} }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
      {cases.map((caseItem, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -10, transition: { duration: 0.2 } }}
          className="relative group cursor-pointer"
          onClick={() => onCaseSelect(caseItem)}
        >
          {/* 2D Case Display */}
          <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 group-hover:border-slate-500 transition-all duration-300 flex items-center justify-center">
            <FallbackCase
              caseType={caseItem.rarity}
              glowIntensity={1.2}
            />
          </div>
          
          {/* Case Info */}
          <div className="mt-4 text-center">
            <h3 className="text-white font-bold text-lg mb-1">{caseItem.name}</h3>
            
            {/* Rarity Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <motion.div
                className={`h-2 rounded-full ${
                  caseItem.rarity === 'common' ? 'bg-gray-500' :
                  caseItem.rarity === 'rare' ? 'bg-blue-500' :
                  caseItem.rarity === 'epic' ? 'bg-purple-500' :
                  caseItem.rarity === 'legendary' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
              />
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full" />
              <span className="text-white font-bold">{caseItem.price}</span>
            </div>
          </div>
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </motion.div>
      ))}
    </div>
  );
};