import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useGames, useRankings } from '../hooks/useGames';
import { Trophy, TrendingUp, Crown, Flame, User, ChevronRight } from 'lucide-react';

export function LeaderboardPage() {
  const { profile } = useAuth();
  const { t, fmt } = useI18n();
  const { games } = useGames();
  const [selectedGame, setSelectedGame] = useState<string>('all');

  useEffect(() => {
    if (games.length > 0 && selectedGame === 'all') {
    }
  }, [games, selectedGame]);

  const { rankings } = useRankings(selectedGame === 'all' ? undefined : selectedGame);

  const tierBadges: Record<string, string> = {
    bronze: 'rank-bronze',
    silver: 'rank-silver',
    gold: 'rank-gold',
    platinum: 'rank-platinum',
    diamond: 'rank-diamond',
    master: 'rank-master',
    grandmaster: 'bg-gradient-to-br from-yellow-300 via-red-500 to-purple-600 text-white',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-gaming-neon-yellow" />
            {t.leaderboard.title}
          </h1>
          <p className="text-gray-400">{t.leaderboard.subtitle}</p>
        </div>
      </div>

      {/* Game Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGame('all')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            selectedGame === 'all'
              ? 'bg-gaming-electric-500 text-white'
              : 'bg-gaming-dark-700 text-gray-400 hover:bg-gaming-dark-600'
          }`}
        >
          {t.leaderboard.allGames}
        </button>
        {games.slice(0, 6).map((game) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedGame === game.id
                ? 'bg-gaming-electric-500 text-white'
                : 'bg-gaming-dark-700 text-gray-400 hover:bg-gaming-dark-600'
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>

      {/* Top 3 Players */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="card order-2 md:order-1 pt-8">
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-2xl bg-gaming-dark-600 overflow-hidden">
                  {rankings[1]?.profile?.avatar_url ? (
                    <img src={rankings[1].profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute -top-4 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
                  <span className="font-gaming font-bold text-gaming-dark-900">2</span>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1">
                {rankings[1]?.profile?.display_name || rankings[1]?.profile?.username || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-400 mb-3">@{rankings[1]?.profile?.username}</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`rank-badge ${tierBadges[rankings[1]?.tier] ?? ''}`}>
                  {rankings[1]?.tier?.charAt(0).toUpperCase()}
                </span>
                <span className="text-gaming-neon-yellow font-semibold">{rankings[1]?.points?.toLocaleString()} {t.common.pts}</span>
              </div>
              <div className="flex justify-center gap-4 text-sm text-gray-400">
                <span className="text-gaming-neon-green">{rankings[1]?.wins} {t.leaderboard.wins}</span>
                <span className="text-gaming-neon-red">{rankings[1]?.losses} {t.leaderboard.losses}</span>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="card order-1 md:order-2 border-gaming-neon-yellow/30 bg-gradient-to-b from-gaming-neon-yellow/10 to-transparent">
            <div className="text-center">
              <Crown className="w-12 h-12 text-gaming-neon-yellow mx-auto mb-2" />
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 rounded-2xl bg-gaming-dark-600 overflow-hidden ring-4 ring-gaming-neon-yellow/50">
                  {rankings[0]?.profile?.avatar_url ? (
                    <img src={rankings[0].profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute -top-4 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <span className="font-gaming font-bold text-gaming-dark-900">1</span>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">
                {rankings[0]?.profile?.display_name || rankings[0]?.profile?.username || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-400 mb-3">@{rankings[0]?.profile?.username}</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`rank-badge ${tierBadges[rankings[0]?.tier] ?? ''}`}>
                  {rankings[0]?.tier?.charAt(0).toUpperCase()}
                </span>
                <span className="text-gaming-neon-yellow font-bold text-lg">{rankings[0]?.points?.toLocaleString()} {t.common.pts}</span>
              </div>
              <div className="flex justify-center gap-4 text-sm text-gray-400">
                <span className="text-gaming-neon-green">{rankings[0]?.wins} {t.leaderboard.wins}</span>
                <span className="text-gaming-neon-red">{rankings[0]?.losses} {t.leaderboard.losses}</span>
              </div>
              {rankings[0]?.win_streak > 0 && (
                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gaming-neon-green/20 text-gaming-neon-green text-sm">
                  <Flame className="w-4 h-4" />
                  {fmt(t.leaderboard.winStreak, { count: rankings[0].win_streak })}
                </div>
              )}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="card order-3 pt-8">
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-2xl bg-gaming-dark-600 overflow-hidden">
                  {rankings[2]?.profile?.avatar_url ? (
                    <img src={rankings[2].profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute -top-4 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
                  <span className="font-gaming font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1">
                {rankings[2]?.profile?.display_name || rankings[2]?.profile?.username || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-400 mb-3">@{rankings[2]?.profile?.username}</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`rank-badge ${tierBadges[rankings[2]?.tier] ?? ''}`}>
                  {rankings[2]?.tier?.charAt(0).toUpperCase()}
                </span>
                <span className="text-gaming-neon-yellow font-semibold">{rankings[2]?.points?.toLocaleString()} {t.common.pts}</span>
              </div>
              <div className="flex justify-center gap-4 text-sm text-gray-400">
                <span className="text-gaming-neon-green">{rankings[2]?.wins} {t.leaderboard.wins}</span>
                <span className="text-gaming-neon-red">{rankings[2]?.losses} {t.leaderboard.losses}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings List */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">{t.leaderboard.allRankings}</h2>
        <div className="space-y-2">
          {rankings.slice(3).map((rank, index) => {
            const isCurrentUser = rank.user_id === profile?.user_id;
            return (
              <Link
                key={rank.id}
                to={`/profile/${rank.user_id}`}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  isCurrentUser ? 'bg-gaming-electric-500/10 border border-gaming-electric-500/30' : 'bg-gaming-dark-700 hover:bg-gaming-dark-600'
                }`}
              >
                <span className="w-8 text-center font-gaming font-bold text-gray-400">{index + 4}</span>
                <div className="w-10 h-10 rounded-lg bg-gaming-dark-600 overflow-hidden">
                  {rank.profile?.avatar_url ? (
                    <img src={rank.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {rank.profile?.display_name || rank.profile?.username}
                    {isCurrentUser && <span className="text-gaming-electric-500 ml-2">{t.leaderboard.you}</span>}
                  </p>
                </div>
                <span className={`rank-badge ${tierBadges[rank.tier] ?? ''}`}>
                  {rank.tier.charAt(0).toUpperCase()}
                </span>
                <span className="text-gaming-neon-yellow font-semibold">{rank.points.toLocaleString()}</span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Your Rank */}
      {profile && !rankings.find((r) => r.user_id === profile.user_id) && (
        <div className="card border-gaming-electric-500/30 bg-gaming-electric-500/10">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-10 h-10 text-gaming-electric-500" />
            <div>
              <p className="text-gray-400">{t.leaderboard.yourRank}</p>
              <p className="text-xl font-bold text-white">{t.leaderboard.notRanked}</p>
            </div>
            <div className="ml-auto">
              <Link to="/challenges/new" className="btn btn-primary">
                {t.leaderboard.playToRank}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
