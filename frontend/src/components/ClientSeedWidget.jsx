import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function ClientSeedWidget() {
  const { socket } = useSocket();
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState(0);
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [rotateAt, setRotateAt] = useState(null);

  useEffect(() => {
    if (!socket) return;
    const onState = (s) => {
      setClientSeed(s.clientSeed || '');
      setNonce(s.nonce || 0);
      setServerSeedHash(s.serverSeedHash || '');
      setRotateAt(s.rotateAt || null);
    };
    const onUpdated = ({ clientSeed }) => setClientSeed(clientSeed);
    socket.on('fair:state', onState);
    socket.on('fair:updated', onUpdated);
    socket.emit('fair:get');
    return () => {
      socket.off('fair:state', onState);
      socket.off('fair:updated', onUpdated);
    };
  }, [socket]);

  const save = (e) => {
    e.preventDefault();
    if (!socket) return;
    socket.emit('fair:setClientSeed', clientSeed.trim());
  };

  return (
    <div className="border border-slate-700 rounded-md p-4 space-y-3">
      <div className="text-slate-300 font-semibold">Client Seed</div>
      <form onSubmit={save} className="flex gap-2">
        <input value={clientSeed}
               onChange={(e)=>setClientSeed(e.target.value)}
               className="flex-1 bg-slate-800 text-slate-100 rounded px-2 py-1"
               placeholder="Enter your client seed" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1">Save</button>
      </form>
      <div className="text-sm text-slate-400">Nonce: <span className="text-slate-200">{nonce}</span></div>
      <div className="text-sm text-slate-400">Server Seed Hash:</div>
      <div className="text-xs break-all text-slate-500">{serverSeedHash}</div>
      {rotateAt && (
        <div className="text-xs text-slate-500">Rotates: {new Date(rotateAt).toLocaleString()}</div>
      )}
    </div>
  );
}
