import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera, 
  Palette, 
  Crown, 
  Star,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import { AnimatedButton, AnimatedInput } from '../ui/AnimatedComponents';
import { useNotification } from '../../context/NotificationContext';

// Avatar options
const AVATAR_STYLES = {
  classic: {
    name: 'Classic',
    preview: '👤',
    unlocked: true
  },
  cool: {
    name: 'Cool',
    preview: '😎',
    requirement: 'Win 10 games'
  },
  crown: {
    name: 'Royal',
    preview: '👑',
    requirement: 'Win streak of 5'
  },
  star: {
    name: 'Star',
    preview: '⭐',
    requirement: 'Earn $1000 total'
  },
  fire: {
    name: 'Fire',
    preview: '🔥',
    requirement: 'Win streak of 10'
  },
  diamond: {
    name: 'Diamond',
    preview: '💎',
    requirement: 'VIP status'
  }
};

// Color themes for profiles
const COLOR_THEMES = {
  blue: {
    name: 'Ocean Blue',
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#60a5fa',
    gradient: 'from-blue-600 to-blue-800'
  },
  purple: {
    name: 'Royal Purple',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    gradient: 'from-purple-600 to-purple-800'
  },
  green: {
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    gradient: 'from-green-600 to-green-800'
  },
  red: {
    name: 'Crimson Red',
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
    gradient: 'from-red-600 to-red-800'
  },
  gold: {
    name: 'Golden Glory',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    gradient: 'from-yellow-600 to-yellow-800'
  },
  neon: {
    name: 'Neon Glow',
    primary: '#00ff88',
    secondary: '#00cc6a',
    accent: '#88ffcc',
    gradient: 'from-green-400 to-cyan-400',
    requirement: 'Unlock 10 achievements'
  }
};

// Profile frames/borders
const PROFILE_FRAMES = {
  none: {
    name: 'None',
    preview: '⬜',
    class: '',
    unlocked: true
  },
  basic: {
    name: 'Basic',
    preview: '🔲',
    class: 'ring-2 ring-gray-500',
    unlocked: true
  },
  premium: {
    name: 'Premium',
    preview: '✨',
    class: 'ring-4 ring-gradient-to-r ring-yellow-400',
    requirement: 'Reach level 10'
  },
  legendary: {
    name: 'Legendary',
    preview: '👑',
    class: 'ring-4 ring-gradient-to-r ring-yellow-500 shadow-lg shadow-yellow-500/50',
    requirement: 'Unlock 25 achievements'
  }
};

// Background patterns
const BACKGROUND_PATTERNS = {
  solid: {
    name: 'Solid Color',
    preview: '🎨',
    class: '',
    unlocked: true
  },
  gradient: {
    name: 'Gradient',
    preview: '🌈',
    class: 'bg-gradient-to-br',
    unlocked: true
  },
  particles: {
    name: 'Floating Particles',
    preview: '✨',
    class: 'bg-pattern-particles',
    requirement: 'Win 50 games'
  },
  geometric: {
    name: 'Geometric',
    preview: '🔷',
    class: 'bg-pattern-geometric',
    requirement: 'VIP status'
  }
};

// Title/Badge system
const TITLES = {
  newbie: {
    name: 'Newbie',
    color: 'text-gray-400',
    unlocked: true
  },
  player: {
    name: 'Player',
    color: 'text-blue-400',
    requirement: 'Play 10 games'
  },
  winner: {
    name: 'Winner',
    color: 'text-green-400',
    requirement: 'Win 25 games'
  },
  veteran: {
    name: 'Veteran',
    color: 'text-purple-400',
    requirement: 'Play 100 games'
  },
  champion: {
    name: 'Champion',
    color: 'text-yellow-400',
    requirement: 'Win 100 games'
  },
  legend: {
    name: 'Legend',
    color: 'text-red-400',
    requirement: 'Win streak of 25'
  }
};

export const ProfileCustomization = ({ playerStats, onSave }) => {
  const [profile, setProfile] = useState({
    displayName: '',
    avatar: 'classic',
    colorTheme: 'blue',
    frame: 'none',
    background: 'solid',
    title: 'newbie',
    bio: '',
    showStats: true,
    showAchievements: true
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const { success, error } = useNotification();

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('playerProfile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Check if item is unlocked based on player stats
  const isUnlocked = (requirement) => {
    if (!requirement) return true;
    if (!playerStats) return false;

    if (requirement.includes('Win') && requirement.includes('games')) {
      const number = parseInt(requirement.match(/\d+/)[0]);
      return playerStats.totalWins >= number;
    }
    if (requirement.includes('streak')) {
      const number = parseInt(requirement.match(/\d+/)[0]);
      return playerStats.maxStreak >= number;
    }
    if (requirement.includes('$')) {
      const number = parseInt(requirement.match(/\d+/)[0]);
      return playerStats.totalEarned >= number;
    }
    if (requirement.includes('achievements')) {
      const number = parseInt(requirement.match(/\d+/)[0]);
      return playerStats.achievementsUnlocked >= number;
    }
    if (requirement.includes('level')) {
      const number = parseInt(requirement.match(/\d+/)[0]);
      return playerStats.level >= number;
    }

    return false;
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveProfile = () => {
    try {
      localStorage.setItem('playerProfile', JSON.stringify(profile));
      onSave?.(profile);
      setHasChanges(false);
      success('Profile saved successfully!');
    } catch (err) {
      error('Failed to save profile');
    }
  };

  const resetProfile = () => {
    setProfile({
      displayName: '',
      avatar: 'classic',
      colorTheme: 'blue',
      frame: 'none',
      background: 'solid',
      title: 'newbie',
      bio: '',
      showStats: true,
      showAchievements: true
    });
    setHasChanges(true);
  };

  // Profile preview component
  const ProfilePreview = () => {
    const theme = COLOR_THEMES[profile.colorTheme];
    
    return (
      <motion.div
        animate={previewMode ? { scale: 1.1 } : { scale: 1 }}
        className="relative"
      >
        <div className={`
          p-6 rounded-xl bg-gradient-to-br ${theme.gradient} 
          ${PROFILE_FRAMES[profile.frame].class}
          ${BACKGROUND_PATTERNS[profile.background].class}
        `}>
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              {AVATAR_STYLES[profile.avatar].preview}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                {profile.displayName || 'Your Name'}
              </h3>
              <span className={`text-sm font-medium ${TITLES[profile.title].color}`}>
                {TITLES[profile.title].name}
              </span>
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <p className="text-white/80 text-sm mb-4 italic">
              "{profile.bio}"
            </p>
          )}
          
          {/* Quick stats */}
          {profile.showStats && playerStats && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded p-2">
                <div className="text-white font-bold">{playerStats.totalWins}</div>
                <div className="text-white/60 text-xs">Wins</div>
              </div>
              <div className="bg-white/10 rounded p-2">
                <div className="text-white font-bold">{playerStats.currentStreak}</div>
                <div className="text-white/60 text-xs">Streak</div>
              </div>
              <div className="bg-white/10 rounded p-2">
                <div className="text-white font-bold">{playerStats.level || 1}</div>
                <div className="text-white/60 text-xs">Level</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'advanced', name: 'Advanced', icon: Sparkles }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            <h2 className="text-xl font-bold text-white">Profile Preview</h2>
            <ProfilePreview />
            
            <div className="flex gap-2">
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex-1"
              >
                {previewMode ? 'Normal' : 'Preview'}
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Customize Profile</h1>
            <div className="flex gap-2">
              <AnimatedButton
                variant="secondary"
                onClick={resetProfile}
                disabled={!hasChanges}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </AnimatedButton>
              <AnimatedButton
                variant="success"
                onClick={saveProfile}
                disabled={!hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </AnimatedButton>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                
                <AnimatedInput
                  label="Display Name"
                  value={profile.displayName}
                  onChange={(e) => updateProfile('displayName', e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={20}
                />
                
                <div>
                  <label className="text-white block mb-3">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => updateProfile('bio', e.target.value)}
                    placeholder="Tell others about yourself..."
                    maxLength={100}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white resize-none focus:border-blue-500 transition-colors"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    {profile.bio.length}/100 characters
                  </div>
                </div>

                {/* Title Selection */}
                <div>
                  <label className="text-white block mb-3">Title</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TITLES).map(([key, title]) => (
                      <button
                        key={key}
                        onClick={() => updateProfile('title', key)}
                        disabled={!isUnlocked(title.requirement)}
                        className={`
                          p-3 rounded-lg border-2 transition-all text-left
                          ${profile.title === key
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-600 hover:border-slate-500'
                          }
                          ${!isUnlocked(title.requirement) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className={`font-medium ${title.color}`}>{title.name}</div>
                        {title.requirement && !isUnlocked(title.requirement) && (
                          <div className="text-xs text-slate-500 mt-1">{title.requirement}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Visual Customization</h3>
                
                {/* Avatar Selection */}
                <div>
                  <label className="text-white block mb-3">Avatar</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(AVATAR_STYLES).map(([key, avatar]) => (
                      <button
                        key={key}
                        onClick={() => updateProfile('avatar', key)}
                        disabled={!isUnlocked(avatar.requirement)}
                        className={`
                          p-4 rounded-lg border-2 transition-all text-center
                          ${profile.avatar === key
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-600 hover:border-slate-500'
                          }
                          ${!isUnlocked(avatar.requirement) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="text-2xl mb-2">{avatar.preview}</div>
                        <div className="text-xs text-white">{avatar.name}</div>
                        {avatar.requirement && !isUnlocked(avatar.requirement) && (
                          <div className="text-xs text-slate-500 mt-1">{avatar.requirement}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Theme */}
                <div>
                  <label className="text-white block mb-3">Color Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => updateProfile('colorTheme', key)}
                        disabled={!isUnlocked(theme.requirement)}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          ${profile.colorTheme === key
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-600 hover:border-slate-500'
                          }
                          ${!isUnlocked(theme.requirement) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <div>
                            <div className="text-white text-sm font-medium">{theme.name}</div>
                            {theme.requirement && !isUnlocked(theme.requirement) && (
                              <div className="text-xs text-slate-500">{theme.requirement}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Advanced Options</h3>
                
                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Privacy & Display</h4>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.showStats}
                      onChange={(e) => updateProfile('showStats', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                    />
                    <span className="text-white">Show game statistics on profile</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.showAchievements}
                      onChange={(e) => updateProfile('showAchievements', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                    />
                    <span className="text-white">Show recent achievements</span>
                  </label>
                </div>

                {/* Profile Frame */}
                <div>
                  <label className="text-white block mb-3">Profile Frame</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(PROFILE_FRAMES).map(([key, frame]) => (
                      <button
                        key={key}
                        onClick={() => updateProfile('frame', key)}
                        disabled={!isUnlocked(frame.requirement)}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          ${profile.frame === key
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-600 hover:border-slate-500'
                          }
                          ${!isUnlocked(frame.requirement) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{frame.preview}</span>
                          <div>
                            <div className="text-white text-sm font-medium">{frame.name}</div>
                            {frame.requirement && !isUnlocked(frame.requirement) && (
                              <div className="text-xs text-slate-500">{frame.requirement}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};