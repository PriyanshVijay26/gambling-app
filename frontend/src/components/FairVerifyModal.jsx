import React, { useEffect, useState } from 'react';
import { verifyCoinFlip, verifyMines } from '../utils/fairVerify';

export default function FairVerifyModal({ open, onClose, fair, game, autoServerSeed }) {
  const [serverSeed, setServerSeed] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) { setServerSeed(''); setResult(null); }
    else if (autoServerSeed) setServerSeed(autoServerSeed);
  }, [open, autoServerSeed]);

  if (!open) return null;

  const runVerify = () => {
    if (!serverSeed || !fair) return;
    if (game?.type === 'coinflip') {
      const side = verifyCoinFlip({ serverSeed, clientSeed: fair.clientSeed, nonce: fair.nonce });
      setResult({ ok: true, computed: side });
    } else if (game?.type === 'mines') {
      const mines = verifyMines({ serverSeed, clientSeed: fair.clientSeed, nonce: fair.nonce, mineCount: game.mineCount });
      setResult({ ok: true, computed: mines });
    } else {
      setResult({ ok: false, error: 'Unsupported game' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-full max-w-lg">
        <div className="text-white font-semibold mb-2">Verify Result</div>
        <div className="text-sm text-slate-400 mb-2">Enter the revealed server seed to recompute this round.</div>
        <input className="w-full bg-slate-800 text-slate-100 rounded px-2 py-1 mb-3"
               placeholder="Server Seed"
               value={serverSeed}
               onChange={(e)=>setServerSeed(e.target.value)} />
        <button onClick={runVerify} className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1">Verify</button>
        {result && (
          <div className="mt-3 text-sm text-slate-300">
            {result.ok ? (
              <pre className="whitespace-pre-wrap break-all text-slate-400">{JSON.stringify(result.computed, null, 2)}</pre>
            ) : (
              <div className="text-red-400">{result.error}</div>
            )}
          </div>
        )}
        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-slate-300 hover:text-white">Close</button>
        </div>
      </div>
    </div>
  );
}
