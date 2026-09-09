import React from 'react';
import { Gamepad2, FileJson, PlusCircle, ShieldCheck } from 'lucide-react';

export const Header = ({
  onOpenJsonModal,
  onOpenAddModal,
  gamesCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                UNBLOCKED<span className="text-emerald-400 font-black">GAMES</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Unblocked
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              HTML5 Canvas & JS Games stored via iframe in JSON
            </p>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="view-json-catalog-btn"
            onClick={onOpenJsonModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
            title="Inspect games.json catalog"
          >
            <FileJson className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Catalog JSON</span>
            <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800/40">
              {gamesCount}
            </span>
          </button>

          <button
            id="add-custom-game-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-emerald-950"
            title="Add a custom game iframe"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};
