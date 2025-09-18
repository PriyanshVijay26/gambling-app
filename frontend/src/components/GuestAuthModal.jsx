import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function GuestAuthModal({ open, onClose }) {
  const { user, setUser, socket } = useSocket();
  const [username, setUsername] = useState(user?.username || '');

  const save = (e) => {
    e.preventDefault();
    const name = username.trim().slice(0, 20) || `Guest${Math.floor(Math.random()*9999)}`;
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    setUser({ username: name, avatar });
    try { socket?.emit('user:setProfile', { username: name, avatar }); } catch {}
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="min-h-screen flex items-center justify-center p-4 pt-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="harvester-card p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">Welcome!</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose a Username</h2>
              <p className="text-gray-400">Create your unique identity for the gaming platform</p>
            </div>

            {/* Form */}
            <form onSubmit={save} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-3">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                    autoFocus
                  />
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {username.length}/20 characters
                </div>
              </div>

              {/* Preview */}
              {username && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="text-gray-300 text-sm mb-2">Preview:</div>
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim() || 'preview')}`}
                      alt="Avatar preview"
                      className="w-10 h-10 rounded-lg"
                    />
                    <span className="text-white font-medium">
                      {username.trim() || `Guest${Math.floor(Math.random()*9999)}`}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-ghost py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-3"
                >
                  Save Username
                </button>
              </div>
            </form>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
