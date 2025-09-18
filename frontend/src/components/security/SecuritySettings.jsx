import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  UserX,
  Settings,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Plus
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';

const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [responsibleGambling, setResponsibleGambling] = useState({
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0,
    sessionTimeLimit: 0,
    lossLimit: 0,
    selfExclusion: {
      enabled: false,
      duration: 0,
      reason: ''
    },
    realityChecks: {
      enabled: false,
      interval: 30 // minutes
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const { socket, user } = useSocket();
  const { success, error, warning } = useNotification();

  useEffect(() => {
    if (socket && user) {
      // Request current security settings
      socket.emit('security:getSettings');
      socket.emit('security:getSessions');
      
      socket.on('security:settings', (settings) => {
        setTwoFactorEnabled(settings.twoFactorEnabled || false);
        setResponsibleGambling(settings.responsibleGambling || responsibleGambling);
        setBackupCodes(settings.backupCodes || []);
      });
      
      socket.on('security:sessions', (sessionData) => {
        setSessions(sessionData);
      });
      
      socket.on('security:2faSetup', (data) => {
        setQrCode(data.qrCode);
        setShowSetup2FA(true);
      });
      
      socket.on('security:2faEnabled', () => {
        setTwoFactorEnabled(true);
        setShowSetup2FA(false);
        success('Two-factor authentication enabled!');
      });
      
      socket.on('security:2faDisabled', () => {
        setTwoFactorEnabled(false);
        success('Two-factor authentication disabled');
      });
      
      socket.on('security:limitsUpdated', () => {
        success('Responsible gambling limits updated');
      });
      
      socket.on('security:passwordChanged', () => {
        success('Password changed successfully');
        setPasswordData({ current: '', new: '', confirm: '' });
      });
      
      return () => {
        socket.off('security:settings');
        socket.off('security:sessions');
        socket.off('security:2faSetup');
        socket.off('security:2faEnabled');
        socket.off('security:2faDisabled');
        socket.off('security:limitsUpdated');
        socket.off('security:passwordChanged');
      };
    }
  }, [socket, user, success, error]);

  const enable2FA = () => {
    if (socket) {
      socket.emit('security:enable2FA');
    }
  };

  const disable2FA = () => {
    if (socket) {
      socket.emit('security:disable2FA');
    }
  };

  const verify2FA = () => {
    if (socket && verificationCode.length === 6) {
      socket.emit('security:verify2FA', { code: verificationCode });
    }
  };

  const updateResponsibleGambling = () => {
    if (socket) {
      socket.emit('security:updateLimits', responsibleGambling);
    }
  };

  const changePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      error('New passwords do not match');
      return;
    }
    
    if (passwordData.new.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }
    
    if (socket) {
      socket.emit('security:changePassword', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
    }
  };

  const terminateSession = (sessionId) => {
    if (socket) {
      socket.emit('security:terminateSession', { sessionId });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      success('Session terminated');
    }
  };

  const setSelfExclusion = (duration, reason) => {
    if (socket) {
      socket.emit('security:setSelfExclusion', { duration, reason });
      warning(`Self-exclusion set for ${duration} days`);
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Sign in to access security settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Security Settings</h2>
          <p className="text-gray-400">Manage your account security and responsible gambling settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Security */}
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                </div>
              </div>
              
              <div className={`w-3 h-3 rounded-full ${
                twoFactorEnabled ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
            </div>
            
            {!twoFactorEnabled ? (
              <button
                onClick={enable2FA}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Enable 2FA
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Two-factor authentication is enabled</span>
                </div>
                
                <button
                  onClick={disable2FA}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Disable 2FA
                </button>
              </div>
            )}
          </div>

          {/* Password Change */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-gray-400 text-sm">Update your account password</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 pr-10 text-white focus:border-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-slate-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-slate-500 focus:outline-none"
                />
              </div>
              
              <button
                onClick={changePassword}
                disabled={!passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Active Sessions</h3>
                <p className="text-gray-400 text-sm">Manage your login sessions</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.current ? 'bg-green-400' : 'bg-blue-400'
                    }`}></div>
                    <div>
                      <div className="text-white font-medium">
                        {session.device} {session.current && '(Current)'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {session.location} • {session.lastActive}
                      </div>
                    </div>
                  </div>
                  
                  {!session.current && (
                    <button
                      onClick={() => terminateSession(session.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Responsible Gambling */}
        <div className="space-y-6">
          {/* Deposit Limits */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Deposit Limits</h3>
                <p className="text-gray-400 text-sm">Set limits to control spending</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Daily Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={responsibleGambling.dailyLimit}
                  onChange={(e) => setResponsibleGambling(prev => ({
                    ...prev,
                    dailyLimit: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-slate-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Weekly Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={responsibleGambling.weeklyLimit}
                  onChange={(e) => setResponsibleGambling(prev => ({
                    ...prev,
                    weeklyLimit: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-slate-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Monthly Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={responsibleGambling.monthlyLimit}
                  onChange={(e) => setResponsibleGambling(prev => ({
                    ...prev,
                    monthlyLimit: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Session Controls</h3>
                <p className="text-gray-400 text-sm">Manage your gaming time</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Session Time Limit (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={responsibleGambling.sessionTimeLimit}
                  onChange={(e) => setResponsibleGambling(prev => ({
                    ...prev,
                    sessionTimeLimit: parseInt(e.target.value) || 0
                  }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-slate-500 focus:outline-none"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="realityChecks"
                  checked={responsibleGambling.realityChecks.enabled}
                  onChange={(e) => setResponsibleGambling(prev => ({
                    ...prev,
                    realityChecks: {
                      ...prev.realityChecks,
                      enabled: e.target.checked
                    }
                  }))}
                  className="rounded"
                />
                <label htmlFor="realityChecks" className="text-white font-medium">
                  Enable reality checks every {responsibleGambling.realityChecks.interval} minutes
                </label>
              </div>
            </div>
          </div>

          {/* Self-Exclusion */}
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 p-6 rounded-xl border border-red-700/50">
            <div className="flex items-center gap-3 mb-4">
              <UserX className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Self-Exclusion</h3>
                <p className="text-gray-400 text-sm">Temporarily or permanently exclude yourself</p>
              </div>
            </div>
            
            {!responsibleGambling.selfExclusion.enabled ? (
              <div className="space-y-4">
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-red-300 text-sm">
                    Self-exclusion will prevent you from accessing your account for the specified duration.
                    This action cannot be undone early.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelfExclusion(1, 'Cool-off period')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    24 Hours
                  </button>
                  <button
                    onClick={() => setSelfExclusion(7, 'Week break')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    1 Week
                  </button>
                  <button
                    onClick={() => setSelfExclusion(30, 'Month break')}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    1 Month
                  </button>
                  <button
                    onClick={() => setSelfExclusion(365, 'Long-term exclusion')}
                    className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    1 Year
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-red-400 font-bold mb-2">Self-Exclusion Active</div>
                <div className="text-gray-300 text-sm">
                  Duration: {responsibleGambling.selfExclusion.duration} days
                </div>
                <div className="text-gray-400 text-xs">
                  Reason: {responsibleGambling.selfExclusion.reason}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={updateResponsibleGambling}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Responsible Gambling Settings
          </button>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {showSetup2FA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Setup Two-Factor Authentication</h2>
                <p className="text-gray-400">Scan this QR code with your authenticator app</p>
              </div>
              
              {qrCode && (
                <div className="mb-6 text-center">
                  <img src={qrCode} alt="QR Code" className="mx-auto border border-slate-600 rounded-lg" />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Verification Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center text-lg tracking-widest focus:border-slate-500 focus:outline-none"
                    placeholder="000000"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSetup2FA(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verify2FA}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecuritySettings;
