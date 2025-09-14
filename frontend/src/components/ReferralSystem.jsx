import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Copy, Check, Plus } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ReferralSystem = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({ count: 0, earnings: 0 });
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const { socket, user } = useSocket();

  useEffect(() => {
    if (!socket || !user?.username) return;
    
    socket.emit('get-referral-info');
    
    const onReferralInfo = (info) => {
      setReferralCode(info.code);
      setReferralStats(info.stats);
    };

    socket.on('referral-info', onReferralInfo);
    return () => socket.off('referral-info', onReferralInfo);
  }, [socket, user]);

  const generateCode = () => {
    if (!socket || !user?.username) return;
    socket.emit('generate-referral-code');
  };

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useReferralCode = () => {
    if (!socket || !inputCode.trim()) return;
    socket.emit('use-referral-code', inputCode.trim());
    setInputCode('');
  };

  if (!user?.username) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Referral System</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-400">Please set a username to access referrals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Referral System</h3>
      </div>

      <div className="space-y-4">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{referralStats.count}</div>
            <div className="text-sm text-gray-400">Referrals</div>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">${referralStats.earnings.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Earned</div>
          </div>
        </div>

        {/* Your Referral Code */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Your Referral Code</label>
          {referralCode ? (
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono">
                {referralCode}
              </div>
              <button
                onClick={copyCode}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  copied 
                    ? 'bg-green-500 border-green-400 text-white' 
                    : 'bg-slate-700 border-slate-600 text-gray-300 hover:border-primary-500'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <button
              onClick={generateCode}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Code
            </button>
          )}
        </div>

        {/* Use Referral Code */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Enter Referral Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter a friend's code"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
            />
            <button
              onClick={useReferralCode}
              disabled={!inputCode.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              Use
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 bg-slate-700/30 p-3 rounded-lg">
          <p>• Earn 5% of your referrals' winnings</p>
          <p>• New users get a bonus for using a referral code</p>
          <p>• Share your code to earn passive income</p>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;