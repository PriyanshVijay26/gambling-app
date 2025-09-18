import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  X,
  Trophy,
  Coins,
  TrendingUp
} from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      case 'win': return Trophy;
      case 'coins': return Coins;
      case 'multiplier': return TrendingUp;
      default: return Info;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-l-4 shadow-2xl backdrop-blur-sm";
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-900/90 border-green-400 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900/90 border-red-400 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900/90 border-yellow-400 text-yellow-100`;
      case 'win':
        return `${baseStyles} bg-gradient-to-r from-yellow-900/90 to-orange-900/90 border-yellow-400 text-yellow-100`;
      case 'coins':
        return `${baseStyles} bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-blue-400 text-blue-100`;
      case 'multiplier':
        return `${baseStyles} bg-gradient-to-r from-purple-900/90 to-pink-900/90 border-purple-400 text-purple-100`;
      default:
        return `${baseStyles} bg-slate-900/90 border-slate-400 text-slate-100`;
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }}
      className={`${getStyles()} p-4 rounded-lg mb-3 min-w-[320px] max-w-md relative overflow-hidden`}
    >
      {/* Animated background effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: notification.duration || 4,
          ease: "linear"
        }}
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"
      />
      
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex-shrink-0"
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {notification.title && (
              <h4 className="font-semibold mb-1">{notification.title}</h4>
            )}
            <p className="text-sm opacity-90">{notification.message}</p>
            {notification.value && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 font-bold text-lg"
              >
                {notification.value}
              </motion.div>
            )}
          </motion.div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      duration: 4000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Convenience methods for different notification types
  const success = useCallback((message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  const win = useCallback((message, value, options = {}) => {
    return addNotification({ 
      type: 'win', 
      title: '🎉 Big Win!',
      message, 
      value,
      duration: 6000,
      ...options 
    });
  }, [addNotification]);

  const coinsEarned = useCallback((amount, options = {}) => {
    return addNotification({ 
      type: 'coins', 
      title: 'Coins Earned',
      message: `You earned ${amount} coins!`,
      value: `+${amount}`,
      ...options 
    });
  }, [addNotification]);

  const multiplier = useCallback((multiplier, options = {}) => {
    return addNotification({ 
      type: 'multiplier', 
      title: 'Multiplier Hit!',
      message: 'Amazing multiplier achieved!',
      value: `${multiplier}x`,
      duration: 5000,
      ...options 
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    win,
    coinsEarned,
    multiplier
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <AnimatePresence>
          {notifications.map(notification => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationItem 
                notification={notification} 
                onRemove={removeNotification}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};