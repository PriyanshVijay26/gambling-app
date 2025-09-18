import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { 
  Settings, 
  Users, 
  Lock, 
  Globe, 
  Bomb, 
  DollarSign,
  Grid3x3,
  Timer,
  Trophy,
  Plus
} from 'lucide-react';

const GameRoomCreator = ({ onClose }) => {
  const { createRoom, connected } = useSocket();
  const [config, setConfig] = useState({
    roomName: '',
    gameType: 'mines',
    isPrivate: false,
    maxPlayers: 8,
    // Mines specific settings
    gridSize: 5,
    mineCount: 5,
    minBet: 1,
    maxBet: 100,
    timeLimit: 0, // 0 = no limit
    spectatingAllowed: true,
    autoStart: false
  });
  const [isCreating, setIsCreating] = useState(false);

  const gridSizeOptions = [
    { value: 3, label: '3x3 (Beginner)', mines: [1, 2] },
    { value: 4, label: '4x4 (Easy)', mines: [2, 3, 4] },
    { value: 5, label: '5x5 (Normal)', mines: [3, 4, 5, 6] },
    { value: 6, label: '6x6 (Hard)', mines: [5, 6, 7, 8] },
    { value: 8, label: '8x8 (Expert)', mines: [8, 10, 12, 15] }
  ];

  const currentGridOption = gridSizeOptions.find(opt => opt.value === config.gridSize);
  const maxMines = Math.floor(config.gridSize * config.gridSize * 0.4);

  const handleConfigChange = (key, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      
      // Auto-adjust mine count when grid size changes
      if (key === 'gridSize') {
        const option = gridSizeOptions.find(opt => opt.value === value);
        newConfig.mineCount = Math.min(option.mines[0], newConfig.mineCount);
      }
      
      return newConfig;
    });
  };

    const handleCreateRoom = () => {
    if (!connected || !config.roomName.trim()) return;
    
    setIsCreating(true);
    
    try {
      createRoom(config);
      // Navigation will be handled by the socket context when room is created
      onClose();
    } catch (error) {
      console.error('Room creation failed:', error);
      setIsCreating(false);
    }
  };

  const presets = [
    {
      name: 'Quick Play',
      description: 'Fast 3x3 games',
      config: { gridSize: 3, mineCount: 2, minBet: 1, maxBet: 10, timeLimit: 60 }
    },
    {
      name: 'Classic',
      description: 'Standard 5x5 experience',
      config: { gridSize: 5, mineCount: 5, minBet: 5, maxBet: 50, timeLimit: 0 }
    },
    {
      name: 'High Stakes',
      description: 'Expert level with big bets',
      config: { gridSize: 6, mineCount: 8, minBet: 25, maxBet: 500, timeLimit: 0 }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Settings className="w-6 h-6 mr-2 text-primary-400" />
              Create Custom Game Room
            </h2>
            <p className="text-gray-400 mt-1">Configure your own Mines game experience</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Info */}
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Room Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Room Name</label>
                  <input
                    type="text"
                    value={config.roomName}
                    onChange={(e) => handleConfigChange('roomName', e.target.value)}
                    placeholder="My Awesome Mines Room"
                    className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                    maxLength={50}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Privacy</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConfigChange('isPrivate', false)}
                        className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                          !config.isPrivate 
                            ? 'border-primary-500 bg-primary-500/20 text-primary-300' 
                            : 'border-slate-600 text-gray-400 hover:border-slate-500'
                        }`}
                      >
                        <Globe className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Public</div>
                      </button>
                      <button
                        onClick={() => handleConfigChange('isPrivate', true)}
                        className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                          config.isPrivate 
                            ? 'border-primary-500 bg-primary-500/20 text-primary-300' 
                            : 'border-slate-600 text-gray-400 hover:border-slate-500'
                        }`}
                      >
                        <Lock className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Private</div>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Max Players</label>
                    <select
                      value={config.maxPlayers}
                      onChange={(e) => handleConfigChange('maxPlayers', Number(e.target.value))}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                    >
                      {[2, 4, 6, 8, 12, 16].map(num => (
                        <option key={num} value={num}>{num} players</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Configuration */}
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Bomb className="w-5 h-5 mr-2 text-red-400" />
                Mines Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Grid Size</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {gridSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleConfigChange('gridSize', option.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          config.gridSize === option.value
                            ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                            : 'border-slate-600 text-gray-400 hover:border-slate-500'
                        }`}
                      >
                        <Grid3x3 className="w-4 h-4 mx-auto mb-1" />
                        <div className="font-medium">{option.value}x{option.value}</div>
                        <div className="text-xs opacity-75">{option.label.split(' ')[1]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Mine Count ({config.mineCount})
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={maxMines}
                      value={config.mineCount}
                      onChange={(e) => handleConfigChange('mineCount', Number(e.target.value))}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Easy (1)</span>
                      <span>Hard ({maxMines})</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Time Limit</label>
                    <select
                      value={config.timeLimit}
                      onChange={(e) => handleConfigChange('timeLimit', Number(e.target.value))}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value={0}>No limit</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={120}>2 minutes</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Min Bet ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={config.minBet}
                        onChange={(e) => handleConfigChange('minBet', Number(e.target.value))}
                        min={0.1}
                        step={0.1}
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Max Bet ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={config.maxBet}
                        onChange={(e) => handleConfigChange('maxBet', Number(e.target.value))}
                        min={config.minBet}
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={config.spectatingAllowed}
                      onChange={(e) => handleConfigChange('spectatingAllowed', e.target.checked)}
                      className="rounded bg-slate-600 border-slate-500 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Allow spectating</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={config.autoStart}
                      onChange={(e) => handleConfigChange('autoStart', e.target.checked)}
                      className="rounded bg-slate-600 border-slate-500 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Auto-start when full</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Presets & Preview */}
          <div className="space-y-6">
            {/* Quick Presets */}
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Presets</h3>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setConfig(prev => ({ ...prev, ...preset.config }))}
                    className="w-full p-3 text-left bg-slate-600/50 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600 hover:border-slate-500"
                  >
                    <div className="font-medium text-white">{preset.name}</div>
                    <div className="text-sm text-gray-400">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Preview */}
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Grid:</span>
                  <span className="text-white">{config.gridSize}x{config.gridSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mines:</span>
                  <span className="text-white">{config.mineCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`${
                    config.mineCount / (config.gridSize * config.gridSize) < 0.2 ? 'text-green-400' :
                    config.mineCount / (config.gridSize * config.gridSize) < 0.3 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {config.mineCount / (config.gridSize * config.gridSize) < 0.2 ? 'Easy' :
                     config.mineCount / (config.gridSize * config.gridSize) < 0.3 ? 'Medium' : 'Hard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bet Range:</span>
                  <span className="text-white">${config.minBet} - ${config.maxBet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white">Max {config.maxPlayers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRoom}
            disabled={!config.roomName.trim() || isCreating || !connected}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameRoomCreator;