import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_GAMES } from './data/defaultGames';
import { Header } from './components/Header';
import { GameCard } from './components/GameCard';
import { GamePlayer } from './components/GamePlayer';
import { JsonViewerModal } from './components/JsonViewerModal';
import { AddGameModal } from './components/AddGameModal';
import { 
  Search, 
  Gamepad2, 
  Heart, 
  Clock, 
  Sparkles, 
  Grid2X2, 
  Layers, 
  Shield, 
  Code 
} from 'lucide-react';

export default function App() {
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('unblocked_games_catalog');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved games:', e);
      }
    }
    return DEFAULT_GAMES;
  });

  const [activeGame, setActiveGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('unblocked_games_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
    return ['snake', '2048', 'tetris'];
  });

  const [recentIds, setRecentIds] = useState(() => {
    const saved = localStorage.getItem('unblocked_recent_games');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse recent games:', e);
      }
    }
    return ['snake', 'flappy'];
  });

  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch games.json on mount to ensure freshness
  useEffect(() => {
    fetch('/games.json')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge custom games from localStorage
          const saved = localStorage.getItem('unblocked_games_catalog');
          if (saved) {
            try {
              const localList = JSON.parse(saved);
              const customOnly = localList.filter(g => g.isCustom);
              // Avoid duplicates
              const merged = [...data];
              customOnly.forEach(cg => {
                if (!merged.some(m => m.id === cg.id)) {
                  merged.push(cg);
                }
              });
              setGames(merged);
              return;
            } catch (e) {
              console.error(e);
            }
          }
          setGames(data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch /games.json, using bundled catalog', err);
      });
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('unblocked_games_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save recent games to localStorage
  useEffect(() => {
    localStorage.setItem('unblocked_recent_games', JSON.stringify(recentIds));
  }, [recentIds]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSelectGame = (game) => {
    setActiveGame(game);
    setRecentIds(prev => {
      const next = [game.id, ...prev.filter(id => id !== game.id)];
      return next.slice(0, 6);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddGame = (newGame) => {
    const updated = [newGame, ...games];
    setGames(updated);
    localStorage.setItem('unblocked_games_catalog', JSON.stringify(updated));
    setActiveGame(newGame);
  };

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.tags && game.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Favorites') return favorites.includes(game.id);
      return game.category.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [games, searchQuery, selectedCategory, favorites]);

  // Recent games objects
  const recentGames = useMemo(() => {
    return recentIds
      .map(id => games.find(g => g.id === id))
      .filter(Boolean);
  }, [recentIds, games]);

  const categories = ['All', 'Arcade', 'Puzzle', 'Retro', 'Favorites'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        gamesCount={games.length}
        onOpenJsonModal={() => setShowJsonModal(true)}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* If a game is actively playing, show the GamePlayer view */}
        {activeGame ? (
          <GamePlayer
            game={activeGame}
            onBack={() => setActiveGame(null)}
          />
        ) : (
          <>
            {/* Search & Category Filter Section */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    id={`cat-btn-${cat.toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950 font-bold'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat === 'Favorites' ? `★ Favorites (${favorites.length})` : cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px] md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="game-search-input"
                  type="text"
                  placeholder="Search games, tags..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Quick Banner: Unblocked & Offline Ready */}
            <div className="rounded-xl p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/30 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    100% Unblocked & Locally Hosted
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Games are built purely in HTML, CSS, and JS files without external tracking, ads, or AI.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800">
                  JSON Catalog: <span className="text-emerald-400">{games.length} games</span>
                </span>
              </div>
            </div>

            {/* Recently Played Section (if any and not searching) */}
            {!searchQuery && selectedCategory === 'All' && recentGames.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Recently Played</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {recentGames.map(game => (
                    <button
                      key={`recent-${game.id}`}
                      id={`recent-game-${game.id}`}
                      onClick={() => handleSelectGame(game)}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">
                        ▶
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                          {game.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {game.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Games Grid */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Grid2X2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {selectedCategory === 'Favorites' 
                      ? 'Saved Favorites' 
                      : selectedCategory === 'All' 
                        ? 'All Unblocked Games' 
                        : `${selectedCategory} Games`}
                  </span>
                  <span className="text-slate-600 font-normal">
                    ({filteredGames.length})
                  </span>
                </div>
              </div>

              {filteredGames.length === 0 ? (
                <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col items-center gap-3">
                  <Gamepad2 className="w-10 h-10 text-slate-600" />
                  <div className="text-sm font-semibold text-slate-300">
                    No games found
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {selectedCategory === 'Favorites'
                      ? 'You have not added any games to your favorites yet. Click the heart icon on any game card to add it.'
                      : `No games match the query "${searchQuery}". Try a different keyword or reset filters.`}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredGames.map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={handleSelectGame}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer info explaining the architecture */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Built with HTML, CSS, JS games stored as iframes in a JSON file</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Zero AI dependencies</span>
            <span>·</span>
            <button
              onClick={() => setShowJsonModal(true)}
              className="hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              Inspect JSON Schema
            </button>
          </div>
        </div>
      </footer>

      {/* JSON Viewer Modal */}
      {showJsonModal && (
        <JsonViewerModal
          games={games}
          onClose={() => setShowJsonModal(false)}
        />
      )}

      {/* Add Custom Game Modal */}
      {showAddModal && (
        <AddGameModal
          onAddGame={handleAddGame}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
