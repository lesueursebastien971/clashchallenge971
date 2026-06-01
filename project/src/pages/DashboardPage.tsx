import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useChallenges, useWallet, useNotifications, useGames, useRankings } from '../hooks/useGames';
import {
  Swords,
  Trophy,
  TrendingUp,
  Clock,
  ChevronRight,
  Zap,
  Target,
  Flame,
  Medal,
} from 'lucide-react';
import type { Challenge, Profile, Game } from '../types/database';

interface ChallengeWithProfiles extends Challenge {
  challenger?: Profile;
  opponent?: Profile;
  game?: Game;
}

export function DashboardPage() {
  const { profile } = useAuth();
  const { t, fmt } = useI18n();
  const { challenges } = useChallenges() as { challenges: ChallengeWithProfiles[] };
  const { wallet } = useWallet();
  const { notifications } = useNotifications();
  const { games } = useGames();
  const { rankings } = useRankings();

  const pendingChallenges = challenges.filter((c) => c.status === 'pending' && c.opponent_id === profile?.user_id);
  const activeChallenges = challenges.filter(
    (c) => c.status === 'accepted' || c.status === 'in_progress'
  );
  const completedChallenges = challenges.filter((c) => c.status === 'completed').slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);

  const userRank = rankings.find((r) => r.user_id === profile?.user_id);
  const topPlayers = rankings.slice(0, 5);

  // suppress unused warning
  void games;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gaming-electric-500 via-gaming-electric-600 to-gaming-neon-blue p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {fmt(t.dashboard.welcome, { name: profile?.display_name || 'Player' })}
          </h1>
          <p className="text-white/80 mb-4">{t.dashboard.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/matchmaking" className="btn bg-white text-gaming-electric-600 hover:bg-white/90">
              <Target className="w-5 h-5" />
              {t.dashboard.findMatch}
            </Link>
            <Link to="/challenges/new" className="btn bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
              <Swords className="w-5 h-5" />
              {t.dashboard.createChallenge}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<WalletIcon className="w-5 h-5" />}
          label={t.dashboard.creditsLabel}
          value={wallet?.balance?.toLocaleString() || '0'}
          color="yellow"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label={t.dashboard.rankLabel}
          value={userRank?.tier || 'Bronze'}
          color="purple"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label={t.dashboard.winStreakLabel}
          value={userRank?.win_streak?.toString() || '0'}
          color="green"
        />
        <StatCard
          icon={<Medal className="w-5 h-5" />}
          label={t.dashboard.winsLabel}
          value={userRank?.wins?.toString() || '0'}
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Challenges */}
        <div className="lg:col-span-2 space-y-4">
          {pendingChallenges.length > 0 && (
            <div className="card-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gaming-neon-yellow" />
                  {t.dashboard.pendingChallenges}
                </h2>
                <Link to="/challenges" className="text-sm text-gaming-electric-500 hover:text-gaming-electric-400 flex items-center gap-1">
                  {t.common.viewAll} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {pendingChallenges.slice(0, 3).map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gaming-dark-700 border border-gaming-dark-500 hover:border-gaming-electric-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gaming-dark-600 flex items-center justify-center">
                        <span className="text-2xl">{challenge.game?.name?.charAt(0) || '?'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          vs. {challenge.challenger?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {challenge.credits_amount} {t.common.credits}
                        </p>
                      </div>
                    </div>
                    <Link to={`/challenges/${challenge.id}`} className="btn btn-primary py-2 px-4 text-sm">
                      {t.dashboard.respond}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div className="card-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Swords className="w-5 h-5 text-gaming-neon-blue" />
                  {t.dashboard.activeChallenges}
                </h2>
              </div>
              <div className="space-y-3">
                {activeChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gaming-dark-700 border border-gaming-neon-blue/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue flex items-center justify-center">
                        <Swords className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {challenge.challenger_id === profile?.user_id
                            ? fmt(t.dashboard.findMatch, {}) // reuse vs pattern below
                            : ''}
                          vs. {challenge.challenger_id === profile?.user_id
                            ? challenge.opponent?.username || 'Unknown'
                            : challenge.challenger?.username || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{challenge.credits_amount} {t.common.credits}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="text-gaming-neon-green">{t.dashboard.inProgress}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/challenges/${challenge.id}`} className="btn btn-secondary py-2 px-4 text-sm">
                      {t.dashboard.view}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Matches */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gaming-neon-green" />
                {t.dashboard.recentMatches}
              </h2>
              <Link to="/challenges" className="text-sm text-gaming-electric-500 hover:text-gaming-electric-400 flex items-center gap-1">
                {t.common.viewAll} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {completedChallenges.length > 0 ? (
              <div className="space-y-2">
                {completedChallenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between p-3 rounded-lg bg-gaming-dark-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        challenge.status === 'completed'
                          ? 'bg-gaming-neon-green/20 text-gaming-neon-green'
                          : 'bg-gaming-neon-red/20 text-gaming-neon-red'
                      }`}>
                        {challenge.status === 'completed' ? 'W' : 'L'}
                      </div>
                      <p className="text-sm font-medium text-white">
                        vs. {challenge.challenger_id === profile?.user_id
                          ? challenge.opponent?.username
                          : challenge.challenger?.username || 'Unknown'}
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(challenge.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t.dashboard.noRecentMatches}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">{t.dashboard.quickActions}</h2>
            <div className="space-y-2">
              <Link to="/challenges/new" className="flex items-center gap-3 p-3 rounded-xl bg-gaming-dark-700 hover:bg-gaming-dark-600 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gaming-electric-500/20 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-gaming-electric-500" />
                </div>
                <span className="font-medium text-white">{t.dashboard.createChallenge}</span>
                <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
              </Link>
              <Link to="/matchmaking" className="flex items-center gap-3 p-3 rounded-xl bg-gaming-dark-700 hover:bg-gaming-dark-600 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gaming-neon-blue/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-gaming-neon-blue" />
                </div>
                <span className="font-medium text-white">{t.dashboard.findPlayers}</span>
                <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-3 p-3 rounded-xl bg-gaming-dark-700 hover:bg-gaming-dark-600 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gaming-neon-yellow/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-gaming-neon-yellow" />
                </div>
                <span className="font-medium text-white">{t.nav.leaderboard}</span>
                <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
              </Link>
            </div>
          </div>

          {/* Top Players */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{t.dashboard.topPlayers}</h2>
              <Link to="/leaderboard" className="text-sm text-gaming-electric-500 hover:text-gaming-electric-400">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="space-y-2">
              {topPlayers.map((player, index) => (
                <Link key={player.id} to={`/profile/${player.user_id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark-700 transition-all">
                  <div className={`rank-badge ${
                    index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : 'bg-gaming-dark-600 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {player.profile?.display_name || player.profile?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">{player.points} {t.common.pts}</p>
                  </div>
                  <span className="badge-primary text-xs">{player.tier}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          {recentNotifications.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{t.nav.notifications}</h2>
                <Link to="/notifications" className="text-sm text-gaming-electric-500 hover:text-gaming-electric-400">
                  {t.common.viewAll}
                </Link>
              </div>
              <div className="space-y-2">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${notification.is_read ? 'bg-gaming-dark-700' : 'bg-gaming-electric-500/10 border border-gaming-electric-500/30'}`}
                  >
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'yellow' | 'purple' | 'green' | 'blue' }) {
  const colors = {
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-gaming-electric-500 to-gaming-electric-600',
    green: 'from-gaming-neon-green to-emerald-500',
    blue: 'from-gaming-neon-blue to-blue-500',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-gaming">{value}</p>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1z" />
      <path d="M21 12H3" />
      <path d="M17 16h2" />
    </svg>
  );
}
