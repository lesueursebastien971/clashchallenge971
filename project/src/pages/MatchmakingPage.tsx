import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useGames } from '../hooks/useGames';
import { supabase } from '../lib/supabase';
import {
  Search,
  Filter,
  Gamepad2,
  Star,
  Swords,
  User,
  Loader2,
  X,
} from 'lucide-react';
import type { Profile, UserGame, Game } from '../types/database';

interface PlayerWithStats extends Profile {
  user_games?: UserGame[];
  rankings?: { points: number; tier: string }[];
}

export function MatchmakingPage() {
  const { profile } = useAuth();
  const { t, fmt } = useI18n();
  const { games } = useGames();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [minPoints, setMinPoints] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchPlayers();
  }, []);

  async function searchPlayers() {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*, user_games(*), rankings(points, tier)')
        .neq('id', profile?.id || '')
        .order('last_seen_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('username', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      let filteredData = data as PlayerWithStats[];

      if (selectedGame) {
        filteredData = filteredData.filter((p) =>
          p.user_games?.some((ug) => ug.game_id === selectedGame.id)
        );
        if (selectedPlatform) {
          filteredData = filteredData.filter((p) =>
            p.user_games?.some((ug) => ug.game_id === selectedGame.id && ug.platform === selectedPlatform)
          );
        }
      }

      if (minPoints) {
        const min = parseInt(minPoints);
        filteredData = filteredData.filter((p) =>
          (p.rankings || []).some((r) => r.points >= min)
        );
      }

      setPlayers(filteredData);
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    searchPlayers();
  }

  function clearFilters() {
    setSelectedGame(null);
    setSelectedPlatform('');
    setMinPoints('');
    setSearchQuery('');
    searchPlayers();
  }

  const hasActiveFilters = selectedGame || selectedPlatform || minPoints || searchQuery;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{t.matchmaking.title}</h1>
        <p className="text-gray-400">{t.matchmaking.subtitle}</p>
      </div>

      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
              placeholder={t.matchmaking.searchPlaceholder}
            />
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary">
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">{t.matchmaking.filters}</span>
          </button>
          <button type="submit" className="btn btn-primary">
            {t.matchmaking.searchBtn}
          </button>
        </form>

        {showFilters && (
          <div className="card space-y-4 animate-slide-down">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.matchmaking.gameFilter}</label>
                <select
                  value={selectedGame?.id || ''}
                  onChange={(e) => {
                    const game = games.find((g) => g.id === e.target.value);
                    setSelectedGame(game || null);
                    setSelectedPlatform('');
                  }}
                  className="input"
                >
                  <option value="">{t.matchmaking.allGames}</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.matchmaking.platformFilter}</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="input"
                  disabled={!selectedGame}
                >
                  <option value="">{t.matchmaking.allPlatforms}</option>
                  {['PS5', 'Xbox', 'PC', 'Nintendo Switch'].map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.matchmaking.minPoints}</label>
                <input
                  type="number"
                  value={minPoints}
                  onChange={(e) => setMinPoints(e.target.value)}
                  className="input"
                  placeholder={t.matchmaking.minPointsPlaceholder}
                  min="0"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gaming-electric-500 hover:text-gaming-electric-400 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t.matchmaking.clearFilters}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <span className="badge-primary">
              {fmt(t.matchmaking.activeFilterSearch, { query: searchQuery })}
              <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedGame && (
            <span className="badge-neon">
              {selectedGame.name}
              <button onClick={() => setSelectedGame(null)} className="ml-1 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedPlatform && (
            <span className="badge-neon">
              {selectedPlatform}
              <button onClick={() => setSelectedPlatform('')} className="ml-1 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minPoints && (
            <span className="badge-neon">
              {fmt(t.matchmaking.activeFilterPoints, { points: minPoints })}
              <button onClick={() => setMinPoints('')} className="ml-1 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gaming-electric-500 animate-spin" />
        </div>
      ) : players.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t.matchmaking.noPlayers}</h2>
          <p className="text-gray-400">{t.matchmaking.noPlayersHint}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} challengeLabel={t.profile.challengeBtn} ptsLabel={t.common.pts} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, challengeLabel, ptsLabel }: { player: PlayerWithStats; challengeLabel: string; ptsLabel: string }) {
  const playerRankings = player.rankings || [];
  const totalPoints = playerRankings.reduce((sum, r) => sum + (r.points || 0), 0);
  const bestTier = playerRankings.length > 0 ? playerRankings[0].tier : 'bronze';

  return (
    <div className="card group hover:border-gaming-electric-500/50 transition-all">
      <div className="flex gap-4">
        <Link to={`/profile/${player.user_id}`} className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gaming-dark-600 overflow-hidden">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>
          {player.is_online && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gaming-neon-green border-2 border-gaming-dark-800" />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/profile/${player.user_id}`}>
            <h3 className="font-semibold text-white group-hover:text-gaming-electric-500 transition-colors">
              {player.display_name || player.username}
            </h3>
          </Link>
          <p className="text-sm text-gray-400">@{player.username}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-sm text-gaming-neon-yellow">
              <Star className="w-4 h-4" />
              <span>{totalPoints.toLocaleString()} {ptsLabel}</span>
            </div>
            <span className={`badge text-xs ${
              bestTier === 'master' || bestTier === 'grandmaster'
                ? 'badge-success'
                : bestTier === 'diamond' || bestTier === 'platinum'
                  ? 'badge-neon'
                  : 'badge-primary'
            }`}>
              {bestTier}
            </span>
          </div>
          {player.user_games && player.user_games.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {player.user_games.slice(0, 3).map((ug) => (
                <span key={ug.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gaming-dark-700 text-xs text-gray-400">
                  <Gamepad2 className="w-3 h-3" />
                </span>
              ))}
            </div>
          )}
        </div>

        <Link to={`/challenges/new?player=${player.user_id}`} className="btn btn-primary py-2 px-3 self-center">
          <Swords className="w-5 h-5" />
          <span className="hidden sm:inline">{challengeLabel}</span>
        </Link>
      </div>
    </div>
  );
}
