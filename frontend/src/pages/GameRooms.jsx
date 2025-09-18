import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  Lock, 
  Globe, 
  Play, 
  Settings,
  Bomb,
  Clock,
  Eye,
  Crown,
  RefreshCw
} from 'lucide-react';
import GameRoomCreator from '../components/GameRoomCreator';

const GameRooms = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private', 'joinable'
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { availableRooms, joinRoom, refreshRooms, connected, currentRoom } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected && availableRooms.length === 0) { // Only refresh if no rooms loaded
      refreshRooms();
      setIsLoading(false);
    } else if (connected) {
      setIsLoading(false);
    }
  }, [connected]); // Remove refreshRooms from deps to prevent infinite loop

  useEffect(() => {
    if (currentRoom) {
      // Navigate to room when successfully joined
      navigate(`/room/${currentRoom.id}`);
    }
  }, [currentRoom, navigate]);

  const handleRoomCreated = (roomData) => {
    // Auto-join the created room
    joinRoom({ roomId: roomData.id });
  };

  const handleJoinRoom = (roomId, code = null) => {
    joinRoom({ roomId, code });
  };

  const joinWithCode = () => {
    if (!joinCode.trim()) return;
    joinRoom({ code: joinCode.trim() });
    setJoinCode('');
  };

  // refreshRooms is provided by context; no local override

  const filteredRooms = availableRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'public':
        return matchesSearch && !room.isPrivate;
      case 'private':
        return matchesSearch && room.isPrivate;
      case 'joinable':
        return matchesSearch && room.players.length < room.maxPlayers && room.status === 'waiting';
      default:
        return matchesSearch;
    }
  });

  const getDifficultyColor = (room) => {
    const ratio = room.config.mineCount / (room.config.gridSize * room.config.gridSize);
    if (ratio < 0.2) return 'text-green-400';
    if (ratio < 0.3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDifficultyText = (room) => {
    const ratio = room.config.mineCount / (room.config.gridSize * room.config.gridSize);
    if (ratio < 0.2) return 'Easy';
    if (ratio < 0.3) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Game Rooms
          </h1>
          <p className="text-gray-400 text-lg">
            Create custom games or join existing rooms
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search rooms..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All', icon: Globe },
                { key: 'public', label: 'Public', icon: Globe },
                { key: 'private', label: 'Private', icon: Lock },
                { key: 'joinable', label: 'Joinable', icon: Users }
              ].map((filterOption) => {
                const Icon = filterOption.icon;
                return (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center ${
                      filter === filterOption.key
                        ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {filterOption.label}
                  </button>
                );
              })}
            </div>

            {/* Join with Code */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room Code"
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none w-32"
                maxLength={6}
              />
              <button
                onClick={joinWithCode}
                disabled={!joinCode.trim() || !connected}
                className="btn-secondary disabled:opacity-50"
              >
                Join
              </button>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={refreshRooms}
                disabled={!connected}
                className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreator(true)}
                disabled={!connected}
                className="btn-primary disabled:opacity-50 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </button>
            </div>
          </div>
        </motion.div>

        {/* Room List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'No rooms match your search.' : 'No rooms available.'}
              </p>
              <button
                onClick={() => setShowCreator(true)}
                className="btn-primary"
              >
                Create the first room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-primary-500/50 transition-all duration-300"
                >
                  {/* Room Header */}
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{room.name}</h3>
                          {room.isPrivate && <Lock className="w-4 h-4 text-yellow-400" />}
                          {room.owner && (
                            <Crown className="w-4 h-4 text-yellow-400" title="Room Owner" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          Created by {room.ownerName || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          room.status === 'waiting' ? 'text-green-400' :
                          room.status === 'playing' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {room.status === 'waiting' ? 'Waiting' :
                           room.status === 'playing' ? 'In Game' : 'Ended'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {room.players.length}/{room.maxPlayers} players
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-400">
                        <Bomb className="w-4 h-4 mr-1 text-red-400" />
                        {room.config.gridSize}x{room.config.gridSize} • {room.config.mineCount} mines
                      </div>
                      <div className={`flex items-center ${getDifficultyColor(room)}`}>
                        <Settings className="w-4 h-4 mr-1" />
                        {getDifficultyText(room)}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-1" />
                        ${room.config.minBet} - ${room.config.maxBet}
                      </div>
                      {room.config.timeLimit > 0 && (
                        <div className="flex items-center text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {room.config.timeLimit}s limit
                        </div>
                      )}
                    </div>

                    {/* Players */}
                    {room.players.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">Players:</div>
                        <div className="flex flex-wrap gap-1">
                          {room.players.slice(0, 6).map((player) => (
                            <div
                              key={player.id}
                              className="px-2 py-1 bg-slate-700 rounded text-xs text-white flex items-center"
                            >
                              {player.username || 'Guest'}
                              {player.isOwner && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
                            </div>
                          ))}
                          {room.players.length > 6 && (
                            <div className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-400">
                              +{room.players.length - 6} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={
                          !connected ||
                          room.players.length >= room.maxPlayers ||
                          room.status === 'ended'
                        }
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {room.players.length >= room.maxPlayers ? 'Full' : 'Join'}
                      </button>
                      
                      {room.config.spectatingAllowed && room.status === 'playing' && (
                        <button
                          onClick={() => handleJoinRoom(room.id)}
                          className="btn-secondary flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Watch
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Room Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <GameRoomCreator
            onClose={() => setShowCreator(false)}
            onRoomCreated={handleRoomCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameRooms;