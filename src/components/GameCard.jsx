import React from 'react';
import { Play, Heart, Star, Gamepad2, Grid3X3, Flame, Swords, Boxes, Shapes, Zap, Bomb } from 'lucide-react';

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSelect
}) => {
  const getGameIcon = () => {
    switch (game.id) {
      case 'snake':
        return <Gamepad2 className="w-8 h-8 text-emerald-400" />;
      case '2048':
        return <Grid3X3 className="w-8 h-8 text-amber-400" />;
      case 'flappy':
        return <Flame className="w-8 h-8 text-sky-400" />;
      case 'pong':
        return <Swords className="w-8 h-8 text-blue-400" />;
      case 'breakout':
        return <Boxes className="w-8 h-8 text-pink-400" />;
      case 'tetris':
        return <Shapes className="w-8 h-8 text-purple-400" />;
      case 'dino':
        return <Zap className="w-8 h-8 text-emerald-400" />;
      case 'minesweeper':
        return <Bomb className="w-8 h-8 text-red-400" />;
      default:
        return <Gamepad2 className="w-8 h-8 text-indigo-400" />;
    }
  };

  const getGradient = () => {
    switch (game.id) {
      case 'snake':
        return 'from-emerald-950/60 to-emerald-900/20 border-emerald-500/30 group-hover:border-emerald-500/60';
      case '2048':
        return 'from-amber-950/60 to-amber-900/20 border-amber-500/30 group-hover:border-amber-500/60';
      case 'flappy':
        return 'from-sky-950/60 to-sky-900/20 border-sky-500/30 group-hover:border-sky-500/60';
      case 'pong':
        return 'from-blue-950/60 to-blue-900/20 border-blue-500/30 group-hover:border-blue-500/60';
      case 'breakout':
        return 'from-pink-950/60 to-pink-900/20 border-pink-500/30 group-hover:border-pink-500/60';
      case 'tetris':
        return 'from-purple-950/60 to-purple-900/20 border-purple-500/30 group-hover:border-purple-500/60';
      case 'dino':
        return 'from-slate-900/90 to-slate-800/40 border-slate-700/60 group-hover:border-slate-500/80';
      case 'minesweeper':
        return 'from-rose-950/60 to-rose-900/20 border-rose-500/30 group-hover:border-rose-500/60';
      default:
        return 'from-indigo-950/60 to-indigo-900/20 border-indigo-500/30 group-hover:border-indigo-500/60';
    }
  };

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => onSelect(game)}
      className={`group relative flex flex-col justify-between p-5 rounded-xl bg-gradient-to-br ${getGradient()} border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 cursor-pointer overflow-hidden backdrop-blur-sm`}
    >
      {/* Top badges & favorite */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {game.badge && (
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-white/10 text-slate-200 border border-white/10">
              {game.badge}
            </span>
          )}
          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50">
            {game.category}
          </span>
        </div>

        <button
          id={`favorite-btn-${game.id}`}
          onClick={(e) => onToggleFavorite(game.id, e)}
          className={`p-1.5 rounded-lg border transition-colors ${
            isFavorite
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-slate-900/60 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
        </button>
      </div>

      {/* Main card content */}
      <div className="flex items-center gap-3.5 my-2">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-inner">
          {getGameIcon()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
            {game.description}
          </p>
        </div>
      </div>

      {/* Footer info: rating & play prompt */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{game.rating || '4.8'}</span>
          <span className="text-slate-500 ml-1">· Iframe HTML5</span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
          Play <Play className="w-3 h-3 fill-emerald-400" />
        </span>
      </div>
    </div>
  );
};
