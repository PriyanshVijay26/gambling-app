import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Users, Clock, Sword, Shield, Eye } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

// Isometric dot pattern background
const IsometricDotBackground = () => {
  const dotSize = 2;
  const spacing = 20;
  
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      <svg 
        width="100%" 
        height="100%" 
        className="absolute inset-0"
        style={{ background: '#000000' }}
      >
        <defs>
          <pattern id="mmIsometricDots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle 
              cx={spacing/2} 
              cy={spacing/2} 
              r={dotSize/2} 
              fill="rgba(255,255,255,0.1)" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mmIsometricDots)" />
        
        {/* Additional isometric grid lines */}
        <defs>
          <pattern id="mmIsometricGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 20 L 20 0 L 40 20 L 20 40 Z" 
              fill="none" 
              stroke="rgba(236, 72, 153, 0.1)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mmIsometricGrid)" />
      </svg>
    </div>
  );
};

const MurderMystery = () => {
  const [gameState, setGameState] = useState('lobby'); // lobby, waiting, playing, finished
  const [players, setPlayers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameId, setGameId] = useState(null);
  const { socket, connected } = useSocket();

  const roles = {
    innocent: { name: 'Innocent', icon: Users, color: 'text-green-400', description: 'Survive until time runs out' },
    murderer: { name: 'Murderer', icon: Sword, color: 'text-red-400', description: 'Eliminate all innocents' },
    detective: { name: 'Detective', icon: Eye, color: 'text-blue-400', description: 'Find and stop the murderer' }
  };

  useEffect(() => {
    if (socket && connected) {
      socket.on('mm:gameState', (data) => {
        setGameState(data.state);
        setPlayers(data.players);
        setTimeLeft(data.timeLeft);
        setGameId(data.gameId);
      });

      socket.on('mm:roleAssigned', (data) => {
        setUserRole(data.role);
      });

      socket.on('mm:playerEliminated', (data) => {
        setPlayers(data.players);
      });

      return () => {
        socket.off('mm:gameState');
        socket.off('mm:roleAssigned');
        socket.off('mm:playerEliminated');
      };
    }
  }, [socket, connected]);

  const joinGame = () => {
    if (socket && connected) {
      socket.emit('mm:joinGame');
    }
  };

  const leaveGame = () => {
    if (socket && connected) {
      socket.emit('mm:leaveGame');
      setGameState('lobby');
      setUserRole(null);
    }
  };

  const eliminatePlayer = (playerId) => {
    if (socket && connected && userRole === 'murderer') {
      socket.emit('mm:eliminatePlayer', { gameId, playerId });
    }
  };

  const accusePlayer = (playerId) => {
    if (socket && connected && userRole === 'detective') {
      socket.emit('mm:accusePlayer', { gameId, playerId });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🕵️‍♂️ Murder Mystery</h1>
          <p className="text-gray-400 text-lg">Roblox-inspired P2P battles with roles and strategy</p>
        </motion.div>

        {/* Game Lobby */}
        {gameState === 'lobby' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Visualization */}
            <div className="lg:col-span-2">
              <div 
                className="relative rounded-xl border-2 border-slate-600 overflow-hidden"
                style={{ 
                  height: '400px',
                  background: '#000000',
                  boxShadow: '0 0 40px rgba(236, 72, 153, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.8)'
                }}
              >
                {/* Isometric dot background */}
                <IsometricDotBackground />
                
                {/* Game content */}
                <div className="relative h-full p-6 flex items-center justify-center" style={{ zIndex: 10 }}>
                  {/* Join game display */}
                  <motion.div 
                    className="relative text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div 
                      className="relative px-8 py-6 border-2 bg-black/80 backdrop-blur-sm"
                      style={{
                        borderColor: '#ec4899',
                        borderRadius: '12px',
                        boxShadow: '0 0 30px rgba(236, 72, 153, 0.5), inset 0 0 20px rgba(236, 72, 153, 0.1)'
                      }}
                    >
                      {/* Corner decorations */}
                      <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                      <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: 'inherit' }}></div>
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: 'inherit' }}></div>
                      
                      <motion.div
                        className="text-4xl font-bold mb-4 text-center text-pink-400"
                        style={{
                          textShadow: '0 0 20px #ec4899, 0 0 40px #ec4899',
                          fontFamily: 'monospace'
                        }}
                        animate={{
                          textShadow: [
                            '0 0 20px #ec4899, 0 0 40px #ec4899',
                            '0 0 30px #ec4899, 0 0 60px #ec4899',
                            '0 0 20px #ec4899, 0 0 40px #ec4899'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        MURDER MYSTERY
                      </motion.div>
                      
                      <div className="text-center text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">
                        READY TO JOIN
                      </div>
                      
                      {/* Role icons display */}
                      <div className="flex justify-center space-x-6 mb-4">
                        <div className="text-green-400 text-center">
                          <Users className="w-8 h-8 mx-auto mb-1" />
                          <div className="text-xs">INNOCENT</div>
                        </div>
                        <div className="text-red-400 text-center">
                          <Sword className="w-8 h-8 mx-auto mb-1" />
                          <div className="text-xs">MURDERER</div>
                        </div>
                        <div className="text-blue-400 text-center">
                          <Eye className="w-8 h-8 mx-auto mb-1" />
                          <div className="text-xs">DETECTIVE</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Join a Game</h2>
                <p className="text-gray-400 mb-6">
                  Enter the lobby and get assigned a role. Work with or against other players to achieve your objective.
                </p>
                
                <div className="space-y-4">
                  {Object.entries(roles).map(([key, role]) => {
                    const Icon = role.icon;
                    return (
                      <div key={key} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-6 h-6 ${role.color}`} />
                          <div>
                            <h3 className="text-white font-bold">{role.name}</h3>
                            <p className="text-gray-400 text-sm">{role.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  onClick={joinGame}
                  disabled={!connected}
                  className="w-full btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎮 Join Game
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Waiting Room */}
        {gameState === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Waiting for Players</h2>
              <p className="text-gray-400">Need at least 3 players to start</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Players ({players.length}/8)</h3>
                <div className="space-y-2">
                  {players.map((player, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-white">{player.name || `Player ${index + 1}`}</span>
                      {player.ready && <div className="w-2 h-2 bg-green-400 rounded-full" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-4">
                  {Math.max(3 - players.length, 0)}
                </div>
                <p className="text-gray-400 mb-6">More players needed</p>
                <button onClick={leaveGame} className="btn-secondary">
                  Leave Game
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Game */}
        {gameState === 'playing' && userRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Game Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${roles[userRole].color}`}>
                    {React.createElement(roles[userRole].icon, { className: "w-6 h-6" })}
                    <span className="font-bold">{roles[userRole].name}</span>
                  </div>
                  <div className="text-gray-400">|</div>
                  <div className="text-white">{roles[userRole].description}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Players</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.filter(p => p.alive).map((player, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      player.isUser 
                        ? 'border-primary-500 bg-primary-500/20' 
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white font-medium mb-2">
                        {player.name || `Player ${index + 1}`}
                      </div>
                      
                      {userRole === 'murderer' && !player.isUser && (
                        <button
                          onClick={() => eliminatePlayer(player.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                        >
                          Eliminate
                        </button>
                      )}
                      
                      {userRole === 'detective' && !player.isUser && (
                        <button
                          onClick={() => accusePlayer(player.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                        >
                          Accuse
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Game Actions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Game Status</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {players.filter(p => p.alive && p.role === 'innocent').length}
                  </div>
                  <div className="text-gray-400 text-sm">Innocents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {players.filter(p => p.alive && p.role === 'murderer').length}
                  </div>
                  <div className="text-gray-400 text-sm">Murderers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {players.filter(p => p.alive && p.role === 'detective').length}
                  </div>
                  <div className="text-gray-400 text-sm">Detectives</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400">
            <div>
              <h4 className="text-green-400 font-semibold mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Innocent
              </h4>
              <p>Stay alive until time runs out. Work together to identify the murderer.</p>
            </div>
            <div>
              <h4 className="text-red-400 font-semibold mb-2 flex items-center">
                <Sword className="w-4 h-4 mr-2" />
                Murderer
              </h4>
              <p>Eliminate all innocents before time runs out. Stay hidden and strike strategically.</p>
            </div>
            <div>
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Detective
              </h4>
              <p>Find and accuse the murderer. You have special abilities to investigate players.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MurderMystery;
