import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coins, Calendar, TrendingUp, Users, Clock, Target, Star } from 'lucide-react';

const PromotionalSystem = ({ user, socket }) => {
  const [promotions, setPromotions] = useState([]);
  const [userPromotions, setUserPromotions] = useState([]);
  const [rainEvent, setRainEvent] = useState(null);
  const [bonuses, setBonuses] = useState({
    welcome: { available: false, amount: 0 },
    deposit: { available: false, percentage: 0 },
    cashback: { available: false, amount: 0 }
  });

  const PROMOTION_TYPES = {
    WELCOME_BONUS: {
      name: 'Welcome Bonus',
      icon: '🎁',
      description: 'Get bonus on first deposit',
      color: 'from-green-500 to-green-700'
    },
    DEPOSIT_BONUS: {
      name: 'Deposit Bonus',
      icon: '💰',
      description: 'Extra percentage on deposits',
      color: 'from-blue-500 to-blue-700'
    },
    CASHBACK: {
      name: 'Cashback',
      icon: '🔄',
      description: 'Get back percentage of losses',
      color: 'from-purple-500 to-purple-700'
    },
    RAIN_EVENT: {
      name: 'Rain Event',
      icon: '🌧️',
      description: 'Free coins for active users',
      color: 'from-yellow-500 to-yellow-700'
    },
    REFERRAL: {
      name: 'Referral Bonus',
      icon: '👥',
      description: 'Earn for inviting friends',
      color: 'from-pink-500 to-pink-700'
    }
  };

  useEffect(() => {
    if (socket && user) {
      socket.on('promotionUpdate', (data) => {
        setPromotions(data.promotions);
        setUserPromotions(data.userPromotions);
        setBonuses(data.bonuses);
      });

      socket.on('rainEventStarted', (event) => {
        setRainEvent(event);
      });

      socket.on('rainEventEnded', () => {
        setRainEvent(null);
      });

      socket.on('bonusClaimed', (bonus) => {
        setBonuses(prev => ({
          ...prev,
          [bonus.type]: { ...prev[bonus.type], available: false }
        }));
      });

      socket.emit('getPromotions');

      return () => {
        socket.off('promotionUpdate');
        socket.off('rainEventStarted');
        socket.off('rainEventEnded');
        socket.off('bonusClaimed');
      };
    }
  }, [socket, user]);

  const claimBonus = (bonusType) => {
    if (socket) {
      socket.emit('claimBonus', { bonusType });
    }
  };

  const participateInRain = () => {
    if (socket && rainEvent) {
      socket.emit('participateRain', { eventId: rainEvent.id });
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="text-center py-8">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Sign in to access promotions and bonuses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gift className="w-8 h-8 text-pink-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Promotions & Bonuses</h2>
          <p className="text-gray-400">Claim your rewards and participate in events</p>
        </div>
      </div>

      {rainEvent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-xl border border-yellow-400 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌧️</div>
              <div>
                <h3 className="text-white font-bold text-xl">Rain Event Active!</h3>
                <p className="text-yellow-100">Free coins dropping for active players</p>
                <p className="text-yellow-200 text-sm">
                  Prize Pool: ${rainEvent.prizePool} • {rainEvent.participants.length} participants
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-white font-bold text-lg mb-2">
                {formatTimeRemaining(rainEvent.endTime)}
              </div>
              <button
                onClick={participateInRain}
                disabled={rainEvent.participants.includes(user.id)}
                className="bg-white text-yellow-600 font-bold py-2 px-4 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rainEvent.participants.includes(user.id) ? 'Participating' : 'Join Rain'}
              </button>
            </div>
          </div>
          
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px'
                }}
                animate={{
                  y: '100vh',
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bonuses.welcome.available && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl border border-green-500"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-white font-bold text-lg mb-2">Welcome Bonus</h3>
              <p className="text-green-100 text-sm mb-4">First deposit bonus</p>
              <div className="text-white text-2xl font-bold mb-4">
                ${bonuses.welcome.amount}
              </div>
              <button
                onClick={() => claimBonus('welcome')}
                className="w-full bg-white text-green-600 font-bold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
              >
                Claim Bonus
              </button>
            </div>
          </motion.div>
        )}

        {bonuses.deposit.available && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl border border-blue-500"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-white font-bold text-lg mb-2">Deposit Bonus</h3>
              <p className="text-blue-100 text-sm mb-4">Extra on your deposit</p>
              <div className="text-white text-2xl font-bold mb-4">
                +{bonuses.deposit.percentage}%
              </div>
              <button
                onClick={() => claimBonus('deposit')}
                className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Claim Bonus
              </button>
            </div>
          </motion.div>
        )}

        {bonuses.cashback.available && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl border border-purple-500"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="text-white font-bold text-lg mb-2">Cashback</h3>
              <p className="text-purple-100 text-sm mb-4">Weekly loss recovery</p>
              <div className="text-white text-2xl font-bold mb-4">
                ${bonuses.cashback.amount}
              </div>
              <button
                onClick={() => claimBonus('cashback')}
                className="w-full bg-white text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Claim Cashback
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Active Promotions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promotion, index) => {
            const promoType = PROMOTION_TYPES[promotion.type] || PROMOTION_TYPES.WELCOME_BONUS;
            const isParticipating = userPromotions.some(up => up.id === promotion.id);
            
            return (
              <motion.div
                key={promotion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-700 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{promoType.icon}</span>
                  <div>
                    <h4 className="text-white font-bold">{promotion.name}</h4>
                    <p className="text-gray-400 text-sm">{promoType.name}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{promotion.description}</p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">
                    Expires: {new Date(promotion.endTime).toLocaleDateString()}
                  </div>
                  <div className={`font-medium ${isParticipating ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isParticipating ? 'Participating' : 'Available'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No active promotions at the moment</p>
            <p className="text-gray-500 text-sm">Check back later for new offers!</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-pink-400" />
          <h3 className="text-xl font-bold text-white">Referral Program</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-bold mb-3">Your Referral Code</h4>
            <div className="bg-slate-700 p-3 rounded-lg flex items-center justify-between">
              <span className="text-yellow-400 font-mono text-lg">{user.referralCode || 'PLAYER123'}</span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded">
                Copy
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Share this code with friends to earn 10% of their first deposit!
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Referral Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Referrals:</span>
                <span className="text-white font-bold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Earned:</span>
                <span className="text-green-400 font-bold">$125.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">This Month:</span>
                <span className="text-blue-400 font-bold">$45.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalSystem;