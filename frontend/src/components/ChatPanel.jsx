import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function ChatPanel() {
  const { socket, connected, user } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!socket) return;
    const onMsg = (m) => setMessages((prev) => [...prev.slice(-199), m]);
    const onHist = (hist) => setMessages(hist);
    socket.on('chat:message', onMsg);
    socket.on('chat:history', onHist);
    socket.emit('chat:history');
    return () => {
      socket.off('chat:message', onMsg);
      socket.off('chat:history', onHist);
    };
  }, [socket]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
  socket.emit('chat:message', { text, username: user?.username, avatar: user?.avatar });
    setText('');
  };

  return (
    <div className="flex flex-col h-full border border-slate-700 rounded-md">
      <div className="p-2 border-b border-slate-700 text-sm text-slate-300">Chat {connected ? '• online' : '• offline'}</div>
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="text-sm text-slate-200 flex items-start gap-2">
            {m.avatar ? (
              <img src={m.avatar} alt="" className="w-5 h-5 rounded" />
            ) : (
              <div className="w-5 h-5 bg-slate-700 rounded" />
            )}
            <div>
              <span className="text-slate-400 mr-1">{m.username || m.userId.slice(0,6)}:</span>
              <span>{m.text}</span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="p-2 flex gap-2">
        <input value={text} onChange={(e)=>setText(e.target.value)} className="flex-1 bg-slate-800 text-slate-100 rounded px-2 py-1 outline-none" placeholder="Type a message" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1">Send</button>
      </form>
    </div>
  );
}
