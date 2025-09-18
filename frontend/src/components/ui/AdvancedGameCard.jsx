import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Play,
  ArrowRight,
  Crown,
  Star,
  Zap,
  Eye,
  Heart
} from 'lucide-react';

const AdvancedGameCard = ({ game, index, featured = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const Icon = game.icon;

  const handleQuickPreview = (e) => {
    e.preventDefault();
    // Implement quick preview functionality
    console.log('Quick preview for', game.name);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative w-full h-full"
    >
      <Link to={game.href} className="block h-full">
        <div className={`
          relative h-full overflow-hidden rounded-2xl border transition-all duration-500
          ${featured 
            ? 'bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-teal-900/40 border-purple-500/30 shadow-2xl shadow-purple-500/20' 
            : 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-gray-600/70'
          }
          hover:shadow-2xl
          ${isHovered ? 'shadow-blue-500/20' : ''}
        `}>
          
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated Border Glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={isHovered ? {
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 40px rgba(147, 51, 234, 0.4)',
                '0 0 20px rgba(59, 130, 246, 0.3)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {featured && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-purple-400/50 rounded-full px-3 py-1"
              >
                <Crown className="w-4 h-4 text-purple-300" />
                <span className="text-purple-200 text-sm font-medium">Featured</span>
              </motion.div>
            )}
            
            {game.players > 20 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-gradient-to-r from-orange-600/30 to-red-600/30 backdrop-blur-sm border border-orange-400/50 rounded-full px-3 py-1"
              >
                <Zap className="w-4 h-4 text-orange-300" />
                <span className="text-orange-200 text-sm font-medium">Hot</span>
              </motion.div>
            )}

            <div className={`flex items-center gap-1 backdrop-blur-sm rounded-full px-3 py-1 border ${
              game.status === 'active' 
                ? 'bg-green-500/20 border-green-500/30' 
                : 'bg-yellow-500/20 border-yellow-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                game.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <span className={`text-sm font-medium capitalize ${
                game.status === 'active' ? 'text-green-300' : 'text-yellow-300'
              }`}>
                {game.status}
              </span>
            </div>
          </div>

          {/* Favorite Button */}
          <motion.button
            onClick={toggleFavorite}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-black/50 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-400 fill-current' : 'text-gray-400'}`} />
          </motion.button>

          {/* Game Image/Icon */}
          <div className="p-6 pb-4">
            <div className="mb-6 relative">
              {game.image && !imageError ? (
                <motion.div 
                  className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  className={`w-24 h-24 game-image-placeholder ${game.className} rounded-2xl shadow-xl relative overflow-hidden`}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-12 h-12 text-white game-placeholder-icon relative z-10" />
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={isHovered ? { x: [-100, 100] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              )}
            </div>
            
            {/* Game Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                  {game.name}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm line-clamp-2">
                  {game.description || getGameDescription(game.name)}
                </p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium text-sm">{game.players}</span>
                  <span className="text-gray-400 text-xs">playing</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium text-sm">
                    {(Math.random() * 3 + 1.5).toFixed(1)}x
                  </span>
                  <span className="text-gray-400 text-xs">avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-2 mt-auto">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl py-3 px-4 transition-all duration-300 hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25">
                  <Play className="w-4 h-4" />
                  <span>Play Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.div>
              
              <motion.button
                onClick={handleQuickPreview}
                className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl border border-gray-600/50 hover:border-gray-500/70 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Hover Overlay with Enhanced Effects */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
};

const getGameDescription = (gameName) => {
  const descriptions = {
    'Mines': 'Navigate through a field of hidden mines to multiply your bet',
    'Coin Flip': 'Simple heads or tails betting with instant results',
    'Limbo': 'Aim for the highest multiplier before the limit',
    'Crash': 'Cash out before the multiplier crashes',
    'Upgrader': 'Upgrade your items with increasing multipliers',
    'Murder Mystery': 'Roblox-inspired P2P battles with roles and strategy',
    'Dice': 'Roll over or under your target number',
    'Plinko': 'Drop the ball and watch it bounce to riches',
    'Towers': 'Climb the tower, avoid the traps'
  };
  return descriptions[gameName] || 'Experience exciting gambling gameplay';
};

export default AdvancedGameCard;