import React, { useState } from 'react';

export default function FairnessRevealPanel({ onReveal }) {
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(null);

  const fetchReveal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fair/reveal');
      const data = await res.json();
      setRevealed(data);
      if (onReveal) onReveal(data.serverSeed);
    } catch (err) {
      console.error('Failed to fetch reveal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-700 rounded-md p-4 space-y-3">
      <div className="text-slate-300 font-semibold">Server Seed Reveal</div>
      <button 
        onClick={fetchReveal} 
        disabled={loading}
        className="bg-orange-600 hover:bg-orange-500 text-white rounded px-3 py-1 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Reveal Current Seed'}
      </button>
      {revealed && (
        <div className="text-sm space-y-2">
          <div className="text-slate-400">Server Seed:</div>
          <div className="break-all text-slate-200 bg-slate-800 p-2 rounded text-xs">{revealed.serverSeed}</div>
          <div className="text-slate-400">Hash:</div>
          <div className="break-all text-slate-500 text-xs">{revealed.serverSeedHash}</div>
        </div>
      )}
    </div>
  );
}