import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Play,
  ArrowRight,
  Crown,
  Star
} from 'lucide-react';

const PremiumGameCard = ({ game, index }) => {
  const [imageError, setImageError] = useState(false);
  const Icon = game.icon;
  
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
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'waiting': return 'text-yellow-400';
      case 'maintenance': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 border-green-500/30';
      case 'waiting': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'maintenance': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };
  
  const isPopular = game.players > 20;
  const isFeatured = game.name === 'Mines' || game.name === 'Crash';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link to={game.href} className="block">
        <div className={`${isFeatured ? 'harvester-card-premium' : 'harvester-card'} p-6 h-full relative overflow-hidden`}>
          {/* Status Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isPopular && (
              <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">Hot</span>
              </div>
            )}
            <div className={`flex items-center gap-1 ${getStatusBg(game.status)} rounded-full px-3 py-1`}>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(game.status)}`} />
              <span className={`${getStatusColor(game.status)} text-sm font-medium capitalize`}>
                {game.status}
              </span>
            </div>
          </div>
          
          {/* Game Icon/Image */}
          <div className="mb-6 relative">
            {game.image && !imageError ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className={`w-20 h-20 game-image-placeholder ${game.className} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <Icon className="w-10 h-10 text-white game-placeholder-icon" />
              </div>
            )}
          </div>
          
          {/* Game Info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
            <p className="text-gray-400 leading-relaxed line-clamp-2">
              {game.description || getGameDescription(game.name)}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-6 py-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">{game.players}</span>
              <span className="text-gray-400 text-sm">playing</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">2.5x</span>
              <span className="text-gray-400 text-sm">avg</span>
            </div>
          </div>
          
          {/* Play Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors duration-200">
              <Play className="w-5 h-5 mr-2" />
              <span>Play Now</span>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:text-blue-300 group-hover:translate-x-2 transition-all duration-200" />
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        </div>
      </Link>
    </motion.div>
  );
};

export default PremiumGameCard;