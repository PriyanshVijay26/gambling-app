import React, { useEffect, useState } from 'react';

export default function FairnessAndLeaderboard() {
  const [fair, setFair] = useState(null);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch('/api/fair/current')
      .then(r => r.json())
      .then(setFair)
      .catch(() => {});
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(setLeaders)
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border border-slate-700 rounded-md p-4">
        <div className="text-slate-300 font-semibold mb-2">Provably Fair</div>
        {fair ? (
          <div className="text-sm text-slate-300 space-y-1">
            <div>Server Seed Hash:</div>
            <div className="break-all text-slate-400">{fair.serverSeedHash}</div>
            <div className="text-slate-400">Rotates: {new Date(fair.rotateAt).toLocaleString()}</div>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">Loading…</div>
        )}
      </div>
      <div className="border border-slate-700 rounded-md p-4">
        <div className="text-slate-300 font-semibold mb-2">Leaderboard</div>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
          {leaders.map((u, i) => (
            <li key={u.id + i} className="flex justify-between">
              <span className="text-slate-400">{u.username || u.id.slice(0,8)}</span>
              <span className="text-slate-200">{u.totalWinnings.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
