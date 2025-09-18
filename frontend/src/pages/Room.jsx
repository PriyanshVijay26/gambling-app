import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Room = () => {
  const { id } = useParams();
  const { currentRoom, leaveRoom, startGame, connected, socket } = useSocket();

  useEffect(() => {
    // If reloading on room page and not in room, you may want to fetch/join
  }, [id]);

  if (!connected) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-gray-400">Connecting...</p>
      </div>
    );
  }

  if (!currentRoom || currentRoom.id !== id) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-gray-400 mb-4">You are not in this room.</p>
        <Link to="/rooms" className="btn-secondary">Back to Rooms</Link>
      </div>
    );
  }

  const { name, players, owner, ownerName, status, config, id: roomId } = currentRoom;

  const isOwner = players.find(p => p.isOwner)?.id === owner;

  const updateSettings = (partial) => {
    socket?.emit('gameRoom:updateSettings', partial);
  };

  const stopGame = () => socket?.emit('gameRoom:stopGame');
  const kick = (pid) => socket?.emit('gameRoom:kick', pid);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Room: {name}</h1>
        <div className="space-x-2">
          <button onClick={leaveRoom} className="btn-secondary">Leave</button>
          {isOwner && status === 'waiting' && (
            <>
              <button onClick={() => startGame({})} className="btn-primary">Start Game</button>
              <button onClick={stopGame} className="btn-secondary">Stop</button>
            </>
          )}
        </div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
        <div className="text-gray-300">Game: Mines</div>
        <div className="text-gray-400 text-sm">Grid: {config.gridSize}x{config.gridSize} • Mines: {config.mineCount}</div>
        <div className="text-gray-400 text-sm">Bet: ${config.minBet} - ${config.maxBet}</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
        {isOwner && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-400">Grid Size</label>
              <input type="number" min="3" max="10" defaultValue={config.gridSize}
                onBlur={(e)=>updateSettings({ gridSize: Number(e.target.value) })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Mines</label>
              <input type="number" min="1" max={config.gridSize*config.gridSize - 1} defaultValue={config.mineCount}
                onBlur={(e)=>updateSettings({ mineCount: Number(e.target.value) })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Min Bet</label>
              <input type="number" min="1" defaultValue={config.minBet}
                onBlur={(e)=>updateSettings({ minBet: Number(e.target.value) })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max Bet</label>
              <input type="number" min={config.minBet} defaultValue={config.maxBet}
                onBlur={(e)=>updateSettings({ maxBet: Number(e.target.value) })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white" />
            </div>
          </div>
        )}
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h2 className="text-white font-semibold mb-2">Players</h2>
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <div key={p.id} className="px-2 py-1 bg-slate-700 rounded text-white text-sm flex items-center gap-2">
              <span>{p.username}{p.isOwner ? ' (Owner)' : ''}</span>
              {isOwner && !p.isOwner && (
                <button onClick={()=>kick(p.id)} className="text-xs text-red-400 hover:text-red-300">Kick</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Room;
