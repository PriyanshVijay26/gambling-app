import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function GuestAuthModal({ open, onClose }) {
  const { user, setUser, socket } = useSocket();
  const [username, setUsername] = useState(user?.username || '');

  if (!open) return null;

  const save = (e) => {
    e.preventDefault();
    const name = username.trim().slice(0, 20) || `Guest${Math.floor(Math.random()*9999)}`;
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    setUser({ username: name, avatar });
    try { socket?.emit('user:setProfile', { username: name, avatar }); } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-full max-w-md">
        <div className="text-white font-semibold mb-2">Choose a username</div>
        <form onSubmit={save} className="space-y-3">
          <input className="w-full bg-slate-800 text-slate-100 rounded px-2 py-1"
                 placeholder="Username"
                 value={username}
                 onChange={(e)=>setUsername(e.target.value)} />
          <div className="text-right">
            <button className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
