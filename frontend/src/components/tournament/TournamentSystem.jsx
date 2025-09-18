import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Clock, Coins, Play, Eye, Calendar, Target, Star, Gift } from 'lucide-react';

const TournamentSystem = ({ user, socket }) => {
  const [tournaments, setTournaments] = useState([]);
  const [userTournaments, setUserTournaments] = useState([]);
  const [activeTournament, setActiveTournament] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const TOURNAMENT_TYPES = {
    ELIMINATION: {
      name: 'Elimination',
      icon: '⚔️',
      description: 'Last player standing wins',
      color: 'from-red-500 to-red-700'
    },
    LEADERBOARD: {
      name: 'Leaderboard',
      icon: '📊',
      description: 'Highest score wins',
      color: 'from-blue-500 to-blue-700'
    },
    SURVIVAL: {
      name: 'Survival',
      icon: '🛡️',
      description: 'Survive the longest',
      color: 'from-green-500 to-green-700'
    },
    TIME_ATTACK: {
      name: 'Time Attack',
      icon: '⏱️',
      description: 'Best time wins',
      color: 'from-purple-500 to-purple-700'
    }
  };

  useEffect(() => {
    if (socket && user) {
      socket.on('tournamentUpdate', (data) => {
        setTournaments(data.tournaments);
        setUserTournaments(data.userTournaments);
        setActiveTournament(data.activeTournament);
      });

      socket.on('tournamentJoined', (tournament) => {
        setUserTournaments(prev => [...prev, tournament]);
      });

      socket.on('tournamentLeft', (tournamentId) => {
        setUserTournaments(prev => prev.filter(t => t.id !== tournamentId));
      });

      socket.on('tournamentStarted', (tournament) => {
        setActiveTournament(tournament);
      });

      socket.on('tournamentEnded', (results) => {
        setActiveTournament(null);
      });

      socket.emit('getTournaments');

      return () => {
        socket.off('tournamentUpdate');
        socket.off('tournamentJoined');
        socket.off('tournamentLeft');
        socket.off('tournamentStarted');
        socket.off('tournamentEnded');
      };
    }
  }, [socket, user]);

  const joinTournament = (tournamentId) => {
    if (socket) {
      socket.emit('joinTournament', { tournamentId });
    }
  };

  const leaveTournament = (tournamentId) => {
    if (socket) {
      socket.emit('leaveTournament', { tournamentId });
    }
  };

  const createTournament = (tournamentData) => {
    if (socket) {
      socket.emit('createTournament', tournamentData);
      setShowCreateModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400';
      case 'active': return 'text-green-400';
      case 'completed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'all') return true;
    return tournament.status === filter;
  });

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Sign in to participate in tournaments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Tournaments</h2>
            <p className="text-gray-400">Compete with other players for prizes</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          Create Tournament
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'upcoming', 'completed'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {filterType}
          </button>
        ))}
      </div>

      {activeTournament && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-xl border border-green-500"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-white font-bold">Tournament Active: {activeTournament.name}</h3>
                <p className="text-green-100 text-sm">You are currently participating</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTournament(activeTournament)}
              className="bg-white text-green-600 font-bold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
            >
              View Details
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament, index) => {
          const tournamentType = TOURNAMENT_TYPES[tournament.type] || TOURNAMENT_TYPES.LEADERBOARD;
          const isJoined = userTournaments.some(ut => ut.id === tournament.id);
          const canJoin = tournament.status === 'upcoming' && tournament.participants.length < tournament.maxParticipants;
          
          return (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300"
            >
              <div className={`bg-gradient-to-r ${tournamentType.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tournamentType.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{tournament.name}</h3>
                      <p className="text-white/80 text-sm">{tournamentType.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">${tournament.prizePool}</div>
                    <div className="text-white/80 text-xs">Prize Pool</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-medium capitalize ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Players</span>
                  <div className="flex items-center gap-1 text-white">
                    <Users className="w-4 h-4" />
                    <span>{tournament.participants.length}/{tournament.maxParticipants}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Entry Fee</span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    <span>${tournament.entryFee}</span>
                  </div>
                </div>
                
                {tournament.status !== 'completed' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Time Remaining</span>
                    <div className="flex items-center gap-1 text-white">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeRemaining(tournament.endTime)}</span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  {tournament.description}
                </div>
              </div>
              
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => setSelectedTournament(tournament)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                
                {!isJoined ? (
                  canJoin ? (
                    <button
                      onClick={() => joinTournament(tournament.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Join
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-600 text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                    >
                      {tournament.status === 'active' ? 'In Progress' : 'Full'}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => leaveTournament(tournament.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Leave
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No tournaments found</h3>
          <p className="text-gray-500">Check back later or create your own tournament!</p>
        </div>
      )}
    </div>
  );
};

export default TournamentSystem;