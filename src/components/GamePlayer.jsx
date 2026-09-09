import React, { useRef, useState } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  Maximize2, 
  ExternalLink, 
  Info, 
  Code2, 
  Gamepad2, 
  Check, 
  Copy 
} from 'lucide-react';

export const GamePlayer = ({ game, onBack }) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [showJson, setShowJson] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(err => {
          console.error("Error attempting fullscreen:", err);
        });
      }
    }
  };

  const handleOpenExternal = () => {
    window.open(game.iframeUrl, '_blank');
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(game, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine iframe height based on game aspect ratio
  const getContainerHeightClass = () => {
    switch (game.id) {
      case 'dino':
        return 'aspect-[600/260] min-h-[260px] max-h-[400px]';
      case 'pong':
        return 'aspect-[600/400] min-h-[380px] max-h-[500px]';
      case 'flappy':
        return 'aspect-[340/520] min-h-[480px] max-h-[580px] max-w-[380px] mx-auto';
      case 'tetris':
        return 'aspect-[380/520] min-h-[480px] max-h-[580px] max-w-[440px] mx-auto';
      case '2048':
      case 'minesweeper':
        return 'aspect-square min-h-[420px] max-h-[520px] max-w-[480px] mx-auto';
      case 'breakout':
      case 'snake':
      default:
        return 'aspect-[4/3] min-h-[440px] max-h-[540px] max-w-[540px] mx-auto';
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            id="back-to-catalog-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catalog</span>
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {game.title}
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {game.category}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            id="toggle-controls-btn"
            onClick={() => setShowControls(prev => !prev)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              showControls
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Controls Guide"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Controls</span>
          </button>

          <button
            id="toggle-json-btn"
            onClick={() => setShowJson(prev => !prev)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              showJson
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="View JSON definition for this iframe"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            id="reload-iframe-btn"
            onClick={handleReload}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reload game frame"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            id="open-tab-btn"
            onClick={handleOpenExternal}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Open game in new window"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            id="fullscreen-btn"
            onClick={handleFullscreen}
            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage / Iframe Container */}
      <div 
        ref={containerRef}
        id="game-iframe-stage"
        className={`relative w-full rounded-xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center ${getContainerHeightClass()}`}
      >
        <iframe
          key={key}
          ref={iframeRef}
          src={game.iframeUrl}
          title={game.title}
          id="game-active-iframe"
          className="w-full h-full border-0 block"
          allow="autoplay; fullscreen; keyboard"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* Optional Details: Controls Bar */}
      {showControls && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 mt-0.5">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                How to Play
              </div>
              <div className="text-sm font-medium text-slate-200 mt-0.5">
                {game.controls}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            {game.tags?.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800/70 text-slate-400 border border-slate-700/60">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* JSON Viewer Inspector Drawer */}
      {showJson && (
        <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 flex flex-col gap-2 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Iframe JSON Storage Object (games.json)
              </span>
            </div>

            <button
              onClick={copyJson}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Object'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
            {JSON.stringify(game, null, 2)}
          </pre>
          <div className="text-xs text-slate-400">
            Each game is referenced by its <code className="text-purple-300">iframeUrl</code>, allowing portable HTML/CSS/JS games or external embeds stored directly inside the catalog.
          </div>
        </div>
      )}
    </div>
  );
};
