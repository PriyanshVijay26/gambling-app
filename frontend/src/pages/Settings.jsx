import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Volume2, 
  Smartphone,
  BarChart3,
  Trophy,
  Bell,
  Shield,
  Info
} from 'lucide-react';
import { AudioSettings } from '../context/AudioContext';
import { ThemeSelector } from '../context/ThemeContext';
import { ProfileCustomization } from '../components/social/ProfileCustomization';
import { AchievementSystem } from '../components/social/AchievementSystem';
import { AnimatedButton } from '../components/ui/AnimatedComponents';
import { useNotification } from '../context/NotificationContext';
import { useAnalytics } from '../utils/analytics';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { success } = useNotification();
  const { trackEvent } = useAnalytics();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, description: 'Customize your profile and personal information' },
    { id: 'appearance', name: 'Appearance', icon: Palette, description: 'Change themes and visual settings' },
    { id: 'audio', name: 'Audio', icon: Volume2, description: 'Configure sound and music settings' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Manage notification preferences' },
    { id: 'achievements', name: 'Achievements', icon: Trophy, description: 'View your unlocked achievements' },
    { id: 'privacy', name: 'Privacy', icon: Shield, description: 'Control your privacy and data settings' },
    { id: 'about', name: 'About', icon: Info, description: 'App information and credits' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    trackEvent('settings_tab_change', { tab: tabId });
  };

  // Mock player stats for demonstration
  const playerStats = {
    gamesPlayed: 156,
    totalWins: 89,
    totalLosses: 67,
    currentStreak: 5,
    maxStreak: 12,
    totalEarned: 2847,
    biggestWin: 1250,
    level: 8,
    achievementsUnlocked: 15
  };

  const NotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium">Game Notifications</label>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
          </div>
          <p className="text-sm text-slate-400">Receive notifications about game wins, losses, and achievements</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium">Achievement Alerts</label>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
          </div>
          <p className="text-sm text-slate-400">Get notified when you unlock new achievements</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium">Sound Effects</label>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
          </div>
          <p className="text-sm text-slate-400">Play sound effects for notifications and game events</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium">System Notifications</label>
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
          </div>
          <p className="text-sm text-slate-400">Show browser notifications even when the app is minimized</p>
        </div>
      </div>
    </div>
  );

  const PrivacySettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Privacy & Data</h3>
      
      <div className="space-y-4">
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium">Analytics & Performance</label>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
          </div>
          <p className="text-sm text-slate-400">Help improve the app by sharing anonymous usage data</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium">Error Reporting</label>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded" />
          </div>
          <p className="text-sm text-slate-400">Automatically send error reports to help fix bugs</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium">Profile Visibility</label>
            <select className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-1">
              <option>Public</option>
              <option>Friends Only</option>
              <option>Private</option>
            </select>
          </div>
          <p className="text-sm text-slate-400">Control who can see your profile and game statistics</p>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
          <h4 className="text-red-400 font-medium mb-2">Data Management</h4>
          <p className="text-sm text-red-300 mb-3">These actions cannot be undone</p>
          <div className="flex gap-2">
            <AnimatedButton variant="danger" size="sm">
              Clear All Data
            </AnimatedButton>
            <AnimatedButton variant="outline" size="sm">
              Export Data
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );

  const AboutSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">About Gaming Platform</h3>
      
      <div className="bg-slate-800 p-6 rounded-lg">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <SettingsIcon className="w-10 h-10 text-white" />
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">Gaming Platform v2.0</h4>
          <p className="text-slate-400">Professional Gambling Experience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">9</div>
            <div className="text-sm text-slate-400">Games Available</div>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400">Provably Fair</div>
            <div className="text-sm text-slate-400">HMAC-SHA256</div>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">Real-time</div>
            <div className="text-sm text-slate-400">Socket.IO</div>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">Mobile</div>
            <div className="text-sm text-slate-400">Optimized</div>
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-slate-400">
          <div>
            <strong className="text-white">Features:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>9 Different gambling games (Mines, Crash, Dice, Plinko, etc.)</li>
              <li>Provably fair gaming with HMAC-SHA256 encryption</li>
              <li>Real-time multiplayer with Socket.IO</li>
              <li>Advanced animations and visual effects</li>
              <li>Comprehensive sound system</li>
              <li>Achievement and progression system</li>
              <li>Profile customization</li>
              <li>Mobile-optimized interface</li>
              <li>Performance monitoring and analytics</li>
              <li>Multiple theme options</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-white">Technology Stack:</strong>
            <div className="mt-2 flex flex-wrap gap-2">
              {['React 19', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Socket.IO', 'Node.js', 'Express'].map(tech => (
                <span key={tech} className="px-2 py-1 bg-slate-700 rounded text-xs">{tech}</span>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <p className="text-center">
              Built with ❤️ for the ultimate gambling experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Customize your gaming experience</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      whileHover={{ x: activeTab === tab.id ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-xs opacity-70 truncate">{tab.description}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 min-h-[600px]"
              >
                {activeTab === 'profile' && (
                  <ProfileCustomization 
                    playerStats={playerStats}
                    onSave={(profile) => {
                      success('Profile saved successfully!');
                      trackEvent('profile_saved', profile);
                    }}
                  />
                )}
                
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Appearance Settings</h3>
                    <ThemeSelector />
                    
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Animation Settings</h4>
                      <label className="flex items-center gap-3 mb-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded" />
                        <span className="text-slate-300">Enable smooth animations</span>
                      </label>
                      <label className="flex items-center gap-3 mb-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded" />
                        <span className="text-slate-300">Enable particle effects</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded" />
                        <span className="text-slate-300">Reduce motion (accessibility)</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {activeTab === 'audio' && <AudioSettings />}
                
                {activeTab === 'notifications' && <NotificationSettings />}
                
                {activeTab === 'achievements' && (
                  <AchievementSystem playerStats={playerStats} />
                )}
                
                {activeTab === 'privacy' && <PrivacySettings />}
                
                {activeTab === 'about' && <AboutSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;