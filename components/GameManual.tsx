import React from 'react';
import { GameInfo } from '../types';

interface GameManualProps {
  info: GameInfo | null;
  loading: boolean;
}

const GameManual: React.FC<GameManualProps> = ({ info, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 text-center text-green-500 space-y-4">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono animate-pulse">
          DECODING GAME DATA...<br/> ACCESSING MAINFRAME...
        </p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-8 text-zinc-600 text-center">
        <div className="mb-2 text-2xl grayscale opacity-20">👾</div>
        <p className="text-xs">Waiting for cartridge initialization...</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 text-sm leading-relaxed font-sans">
      <div className="border-b-2 border-red-900/50 pb-4">
        <h2 className="text-xl text-yellow-500 font-bold uppercase tracking-wider mb-1 font-['Press_Start_2P'] leading-normal">{info.title}</h2>
        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 font-mono mt-2">
          <span className="bg-zinc-800 px-2 py-1 rounded">{info.genre}</span>
          <span className="bg-zinc-800 px-2 py-1 rounded">{info.releaseDate}</span>
        </div>
      </div>

      <section>
        <h3 className="text-green-500 text-xs font-bold uppercase mb-2 tracking-widest">Briefing</h3>
        <p className="text-zinc-300 text-sm font-light">{info.description}</p>
      </section>

      <section>
        <h3 className="text-blue-400 text-xs font-bold uppercase mb-2 tracking-widest">Controls Context</h3>
        <ul className="space-y-2">
          {info.controls.map((ctrl, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs">
              <span className="shrink-0 bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono border border-zinc-700 min-w-[24px] text-center">
                {ctrl.key}
              </span>
              <span className="text-zinc-400">{ctrl.action}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-purple-400 text-xs font-bold uppercase mb-2 tracking-widest">Secrets</h3>
        <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-xs">
          {info.funFacts.map((fact, idx) => (
            <li key={idx}>{fact}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default GameManual;