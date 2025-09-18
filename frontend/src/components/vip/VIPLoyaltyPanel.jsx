import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Star, Calendar, TrendingUp, Trophy, Gift } from 'lucide-react';

const VIPLoyaltyPanel = ({ user, socket }) => {
  const [vipData, setVipData] = useState({
    level: 0,
    points: 0,
    totalWagered: 0,
    nextLevelRequirement: 1000,
    rakeback: {
      available: 0,
      total: 0
    },
    dailyRewards: [],
    achievements: [],
    monthlyBonus: {
      available: false,
      amount: 0
    }
  });
  const [showLevelUp, setShowLevelUp] = useState(false);

  const VIP_LEVELS = {
    0: {
      name: 'Bronze',
      icon: '🥉',
      minWager: 0,
      rakeback: 1,
      monthlyBonus: 5,
      benefits: ['Basic chat privileges', 'Standard support'],
      color: 'from-orange-400 to-red-600',
      textColor: 'text-orange-400'
    },
    1: {
      name: 'Silver',
      icon: '🥈',
      minWager: 1000,
      rakeback: 2,
      monthlyBonus: 15,
      benefits: ['Priority support', '2% rakeback', 'Weekly bonuses'],
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-gray-400'
    },
    2: {
      name: 'Gold',
      icon: '🥇',
      minWager: 5000,
      rakeback: 4,
      monthlyBonus: 50,
      benefits: ['VIP support', '4% rakeback', 'Exclusive tournaments'],
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-400'
    },
    3: {
      name: 'Platinum',
      icon: '💎',
      minWager: 25000,
      rakeback: 6,
      monthlyBonus: 200,
      benefits: ['Personal manager', '6% rakeback', 'VIP events'],
      color: 'from-gray-300 to-gray-500',
      textColor: 'text-gray-300'
    },
    4: {
      name: 'Diamond',
      icon: '💍',
      minWager: 100000,
      rakeback: 8,
      monthlyBonus: 500,
      benefits: ['24/7 dedicated support', '8% rakeback', 'Exclusive rewards'],
      color: 'from-blue-400 to-purple-600',
      textColor: 'text-blue-400'
    }
  };

  const DAILY_REWARDS = {
    1: { amount: 5, bonus: false },
    2: { amount: 8, bonus: false },
    3: { amount: 12, bonus: false },
    4: { amount: 15, bonus: false },
    5: { amount: 20, bonus: false },
    6: { amount: 25, bonus: false },
    7: { amount: 50, bonus: true }
  };

  const ACHIEVEMENTS = {
    first_win: {
      name: 'First Win',
      icon: '🎉',
      requirement: 'Win your first game',
      reward: 10
    },
    high_roller: {
      name: 'High Roller',
      icon: '💰',
      requirement: 'Wager over $1000 in a day',
      reward: 50
    },
    lucky_streak: {
      name: 'Lucky Streak',
      icon: '🍀',
      requirement: 'Win 5 games in a row',
      reward: 25
    },
    vip_member: {
      name: 'VIP Member',
      icon: '👑',
      requirement: 'Reach Gold level',
      reward: 100
    }
  };

  useEffect(() => {
    if (socket && user) {
      socket.on('vipDataUpdate', (data) => {
        const oldLevel = vipData.level;
        setVipData(data);
        
        if (data.level > oldLevel && oldLevel > 0) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
        }
      });

      socket.on('achievementUnlocked', (achievement) => {
        setVipData(prev => ({
          ...prev,
          achievements: [...prev.achievements, achievement.id]
        }));
      });

      socket.emit('getVipData');

      return () => {
        socket.off('vipDataUpdate');
        socket.off('achievementUnlocked');
      };
    }
  }, [socket, user]);

  const claimDailyReward = () => {
    if (socket) {
      socket.emit('claimDailyReward');
    }
  };

  const claimRakeback = () => {
    if (socket) {
      socket.emit('claimRakeback');
    }
  };

  const claimMonthlyBonus = () => {
    if (socket) {
      socket.emit('claimMonthlyBonus');
    }
  };

  const claimAchievementReward = (achievementId) => {
    if (socket) {
      socket.emit('claimAchievementReward', { achievementId });
    }
  };

  const userLevel = Math.max(0, Math.min(4, 
    Object.keys(VIP_LEVELS).reduce((level, key) => {
      return vipData.totalWagered >= VIP_LEVELS[key].minWager ? parseInt(key) : level;
    }, 0)
  ));

  const currentLevel = VIP_LEVELS[userLevel];
  const nextLevel = VIP_LEVELS[userLevel + 1];
  const { totalWagered } = vipData;

  const progressToNext = nextLevel 
    ? Math.min(100, ((totalWagered - currentLevel.minWager) / (nextLevel.minWager - currentLevel.minWager)) * 100)
    : 100;

  const today = new Date().getDay() || 7;
  const { dailyRewards, rakeback } = vipData;
  const nextReward = !dailyRewards.includes(today) ? DAILY_REWARDS[today] : null;

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="text-center py-8">
          <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Sign in to access VIP rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 rounded-2xl text-center max-w-md"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                {currentLevel.icon}
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">LEVEL UP!</h2>
              <p className="text-white">You've reached {currentLevel.name} level!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`bg-gradient-to-br ${currentLevel.color} p-6 rounded-xl border border-slate-700 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentLevel.icon}</div>
            <div>
              <h3 className="text-xl font-bold">{currentLevel.name} Member</h3>
              <p className="text-white/80">Level {userLevel}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{currentLevel.rakeback}%</div>
            <div className="text-sm text-white/80">Rakeback</div>
          </div>
        </div>
        
        {nextLevel && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Progress to {nextLevel.name}</span>
              <span className="text-sm">${totalWagered.toFixed(0)} / ${nextLevel.minWager}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Daily Rewards</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Object.entries(DAILY_REWARDS).map(([day, reward], index) => {
              const isCompleted = dailyRewards.includes(parseInt(day));
              const isToday = index === (dailyRewards.length % 7);
              const canClaim = isToday && !isCompleted;
              
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all ${
                    isCompleted
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : canClaim
                      ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400 animate-pulse'
                      : 'border-slate-600 text-gray-400'
                  }`}
                >
                  <div className="text-lg">{reward.bonus ? '🎁' : '💰'}</div>
                  <div>${reward.amount}</div>
                </div>
              );
            })}
          </div>
          
          {nextReward && (
            <button
              onClick={claimDailyReward}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Claim ${nextReward.amount} Daily Reward
            </button>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Rakeback</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available</span>
              <span className="text-2xl font-bold text-green-400">${rakeback.available.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Earned</span>
              <span className="text-white font-bold">${rakeback.total.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Rate</span>
              <span className={`font-bold ${currentLevel.textColor}`}>{currentLevel.rakeback}%</span>
            </div>
            
            {rakeback.available > 0 && (
              <button
                onClick={claimRakeback}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Claim Rakeback
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">VIP Benefits</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentLevel.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-300">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Achievements</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
            const isUnlocked = vipData.achievements.includes(key);
            
            return (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isUnlocked
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isUnlocked ? 'text-purple-400' : 'text-gray-400'}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-500">{achievement.requirement}</p>
                  </div>
                </div>
                
                {isUnlocked && (
                  <button
                    onClick={() => claimAchievementReward(key)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-1 px-2 rounded transition-colors"
                  >
                    Claim ${achievement.reward}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {vipData.monthlyBonus.available && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Monthly VIP Bonus</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Your {currentLevel.name} level monthly bonus is ready!</p>
              <p className="text-2xl font-bold text-green-400">${vipData.monthlyBonus.amount}</p>
            </div>
            
            <button
              onClick={claimMonthlyBonus}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Claim Bonus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VIPLoyaltyPanel;