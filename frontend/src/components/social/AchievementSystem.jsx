import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Diamond, 
  Award,
  Flame,
  Shield,
  Coins,
  TrendingUp,
  Calendar,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAudio } from '../../context/AudioContext';

// Achievement definitions
const ACHIEVEMENTS = {
  // Beginner achievements
  first_game: {
    id: 'first_game',
    title: 'First Steps',
    description: 'Play your first game',
    icon: Target,
    rarity: 'common',
    points: 10,
    category: 'beginner'
  },
  first_win: {
    id: 'first_win',
    title: 'Taste of Victory',
    description: 'Win your first game',
    icon: Trophy,
    rarity: 'common',
    points: 25,
    category: 'beginner'
  },
  
  // Streak achievements
  win_streak_5: {
    id: 'win_streak_5',
    title: 'Hot Streak',
    description: 'Win 5 games in a row',
    icon: Flame,
    rarity: 'uncommon',
    points: 50,
    category: 'streaks'
  },
  win_streak_10: {
    id: 'win_streak_10',
    title: 'On Fire',
    description: 'Win 10 games in a row',
    icon: Flame,
    rarity: 'rare',
    points: 100,
    category: 'streaks'
  },
  win_streak_25: {
    id: 'win_streak_25',
    title: 'Unstoppable',
    description: 'Win 25 games in a row',
    icon: Crown,
    rarity: 'legendary',
    points: 250,
    category: 'streaks'
  },
  
  // Money achievements
  big_win_100: {
    id: 'big_win_100',
    title: 'Big Winner',
    description: 'Win $100 in a single game',
    icon: Coins,
    rarity: 'uncommon',
    points: 75,
    category: 'money'
  },
  big_win_1000: {
    id: 'big_win_1000',
    title: 'High Roller',
    description: 'Win $1000 in a single game',
    icon: Diamond,
    rarity: 'rare',
    points: 150,
    category: 'money'
  },
  total_earned_10k: {
    id: 'total_earned_10k',
    title: 'Wealthy Gambler',
    description: 'Earn $10,000 total',
    icon: TrendingUp,
    rarity: 'epic',
    points: 200,
    category: 'money'
  },
  
  // Game-specific achievements
  mines_expert: {
    id: 'mines_expert',
    title: 'Minesweeper',
    description: 'Win 50 Mines games',
    icon: Target,
    rarity: 'rare',
    points: 100,
    category: 'games'
  },
  crash_master: {
    id: 'crash_master',
    title: 'Crash Master',
    description: 'Cash out at 10x or higher in Crash',
    icon: Zap,
    rarity: 'epic',
    points: 175,
    category: 'games'
  },
  
  // Time-based achievements
  daily_player: {
    id: 'daily_player',
    title: 'Daily Grinder',
    description: 'Play for 7 consecutive days',
    icon: Calendar,
    rarity: 'uncommon',
    points: 60,
    category: 'loyalty'
  },
  loyal_player: {
    id: 'loyal_player',
    title: 'Loyal Player',
    description: 'Play for 30 consecutive days',
    icon: Shield,
    rarity: 'epic',
    points: 200,
    category: 'loyalty'
  },
  
  // Special achievements
  perfect_mines: {
    id: 'perfect_mines',
    title: 'Perfect Sweep',
    description: 'Reveal all safe tiles in Mines without hitting a mine',
    icon: Star,
    rarity: 'legendary',
    points: 300,
    category: 'special'
  },
  lucky_seven: {
    id: 'lucky_seven',
    title: 'Lucky Seven',
    description: 'Win exactly $777 in a single game',
    icon: Award,
    rarity: 'rare',
    points: 125,
    category: 'special'
  }
};

// Achievement rarity colors
const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-600',
  uncommon: 'from-green-500 to-green-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-yellow-600'
};

// Achievement notification component
const AchievementNotification = ({ achievement, onClose }) => {
  const Icon = achievement.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      className="fixed top-20 right-4 z-[10000] pointer-events-auto"
    >
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 rounded-xl border border-yellow-400 text-white shadow-2xl max-w-sm">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium opacity-90">Achievement Unlocked!</span>
            </div>
            <h4 className="font-bold text-lg">{achievement.title}</h4>
            <p className="text-sm opacity-90">{achievement.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">+{achievement.points} points</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};

// Achievement card component
const AchievementCard = ({ achievement, isUnlocked, progress = 0 }) => {
  const Icon = achievement.icon;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${isUnlocked 
          ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} border-white/20` 
          : 'bg-slate-800 border-slate-600 opacity-60'
        }
      `}
    >
      {/* Rarity indicator */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium capitalize
        ${isUnlocked ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'}
      `}>
        {achievement.rarity}
      </div>
      
      {/* Lock overlay for locked achievements */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${isUnlocked ? 'bg-white/20' : 'bg-slate-700'}
        `}>
          <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-slate-400'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
            {achievement.title}
          </h3>
          <p className={`text-sm ${isUnlocked ? 'text-white/80' : 'text-slate-500'}`}>
            {achievement.description}
          </p>
          
          {/* Progress bar for partially completed achievements */}
          {!isUnlocked && progress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
              <span className="text-xs text-slate-400 mt-1">
                {Math.round(progress * 100)}% complete
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Star className={`w-3 h-3 ${isUnlocked ? 'text-yellow-300' : 'text-slate-500'}`} />
            <span className={`text-xs ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
              {achievement.points} points
            </span>
            {isUnlocked && <CheckCircle className="w-3 h-3 text-green-300" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main achievement system component
export const AchievementSystem = ({ playerStats }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [showNotification, setShowNotification] = useState(null);
  const { success } = useNotification();
  const { gameAudio } = useAudio();

  // Load unlocked achievements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('unlockedAchievements');
    if (saved) {
      setUnlockedAchievements(new Set(JSON.parse(saved)));
    }
  }, []);

  // Check for new achievements
  const checkAchievements = (stats) => {
    const newUnlocked = new Set(unlockedAchievements);
    let hasNewAchievement = false;

    // Check each achievement condition
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (newUnlocked.has(achievement.id)) return;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_game':
          shouldUnlock = stats.gamesPlayed >= 1;
          break;
        case 'first_win':
          shouldUnlock = stats.totalWins >= 1;
          break;
        case 'win_streak_5':
          shouldUnlock = stats.currentStreak >= 5;
          break;
        case 'win_streak_10':
          shouldUnlock = stats.currentStreak >= 10;
          break;
        case 'win_streak_25':
          shouldUnlock = stats.currentStreak >= 25;
          break;
        case 'big_win_100':
          shouldUnlock = stats.biggestWin >= 100;
          break;
        case 'big_win_1000':
          shouldUnlock = stats.biggestWin >= 1000;
          break;
        case 'total_earned_10k':
          shouldUnlock = stats.totalEarned >= 10000;
          break;
        default:
          shouldUnlock = false;
      }

      if (shouldUnlock) {
        newUnlocked.add(achievement.id);
        hasNewAchievement = true;
        
        // Show notification
        setShowNotification(achievement);
        gameAudio.success();
        success(`Achievement unlocked: ${achievement.title}!`);
        
        setTimeout(() => setShowNotification(null), 5000);
      }
    });

    if (hasNewAchievement) {
      setUnlockedAchievements(newUnlocked);
      localStorage.setItem('unlockedAchievements', JSON.stringify([...newUnlocked]));
    }
  };

  // Update achievements when stats change
  useEffect(() => {
    if (playerStats) {
      checkAchievements(playerStats);
    }
  }, [playerStats]);

  // Filter achievements
  const filteredAchievements = Object.values(ACHIEVEMENTS).filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return unlockedAchievements.has(achievement.id);
    if (filter === 'locked') return !unlockedAchievements.has(achievement.id);
    return achievement.category === filter;
  });

  // Calculate total points
  const totalPoints = Object.values(ACHIEVEMENTS)
    .filter(a => unlockedAchievements.has(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  const categories = ['all', 'unlocked', 'locked', 'beginner', 'streaks', 'money', 'games', 'loyalty', 'special'];

  return (
    <div className="p-8 space-y-8">
      {/* Achievement notification */}
      <AnimatePresence>
        {showNotification && (
          <AchievementNotification
            achievement={showNotification}
            onClose={() => setShowNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Achievements</h1>
          <p className="text-slate-400">
            {unlockedAchievements.size} of {Object.keys(ACHIEVEMENTS).length} unlocked • {totalPoints} total points
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
          <div className="text-sm text-slate-400">Achievement Points</div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === category
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementCard
              achievement={achievement}
              isUnlocked={unlockedAchievements.has(achievement.id)}
              progress={0} // You can implement progress calculation here
            />
          </motion.div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No achievements found</h3>
          <p className="text-slate-500">Try a different filter or start playing to unlock achievements!</p>
        </div>
      )}
    </div>
  );
};