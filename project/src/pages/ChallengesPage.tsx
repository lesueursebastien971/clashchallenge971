import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useChallenges } from '../hooks/useGames';
import {
  Swords,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { Challenge, Profile } from '../types/database';

interface ChallengeWithProfiles extends Challenge {
  challenger?: Profile;
  opponent?: Profile;
}

export function ChallengesPage() {
  const { profile } = useAuth();
  const { t, fmt } = useI18n();
  const { challenges, loading } = useChallenges();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const filteredChallenges = challenges.filter((c) => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'active') return c.status === 'accepted' || c.status === 'in_progress';
    if (filter === 'completed') return c.status === 'completed' || c.status === 'declined';
    return true;
  });

  const filters = [
    { id: 'all', label: t.challenges.filterAll },
    { id: 'pending', label: t.challenges.filterPending },
    { id: 'active', label: t.challenges.filterActive },
    { id: 'completed', label: t.challenges.filterCompleted },
  ];

  const statusLabels: Record<string, string> = {
    pending: t.challenges.statusPending,
    accepted: t.challenges.statusAccepted,
    declined: t.challenges.statusDeclined,
    in_progress: t.challenges.statusInProgress,
    completed: t.challenges.statusCompleted,
    cancelled: t.challenges.statusCancelled,
    disputed: t.challenges.statusDisputed,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{t.challenges.title}</h1>
          <p className="text-gray-400">{t.challenges.subtitle}</p>
        </div>
        <Link to="/challenges/new" className="btn btn-neon">
          <Plus className="w-5 h-5" />
          {t.challenges.newChallenge}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === f.id
                ? 'bg-gaming-electric-500 text-white'
                : 'bg-gaming-dark-700 text-gray-400 hover:bg-gaming-dark-600 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-gaming-electric-500 border-t-transparent" />
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="card text-center py-12">
          <Swords className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t.challenges.noChallenges}</h2>
          <p className="text-gray-400 mb-6">
            {filter === 'all'
              ? t.challenges.emptyStart
              : fmt(t.challenges.emptyFilter, { filter: filters.find(f => f.id === filter)?.label || filter })}
          </p>
          <Link to="/challenges/new" className="btn btn-primary">
            {t.challenges.newChallenge}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChallenges.map((challenge: ChallengeWithProfiles) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              currentUserId={profile?.user_id}
              statusLabels={statusLabels}
              credits={t.common.credits}
              respondLabel={t.dashboard.respond}
              challengedYouFmt={(name) => fmt(t.challenges.challengedYou, { name })}
              vsFmt={(name) => fmt(t.challenges.vs, { name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
  currentUserId,
  statusLabels,
  credits,
  respondLabel,
  challengedYouFmt,
  vsFmt,
}: {
  challenge: ChallengeWithProfiles;
  currentUserId?: string;
  statusLabels: Record<string, string>;
  credits: string;
  respondLabel: string;
  challengedYouFmt: (name: string) => string;
  vsFmt: (name: string) => string;
}) {
  const isChallenger = challenge.challenger_id === currentUserId;
  const opponent = (isChallenger ? challenge.opponent : challenge.challenger) as Profile | undefined;

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    pending: { color: 'bg-yellow-500', icon: Clock },
    accepted: { color: 'bg-gaming-neon-blue', icon: CheckCircle },
    declined: { color: 'bg-gaming-neon-red', icon: XCircle },
    in_progress: { color: 'bg-gaming-neon-green', icon: Swords },
    completed: { color: 'bg-gaming-electric-500', icon: CheckCircle },
    cancelled: { color: 'bg-gray-500', icon: XCircle },
    disputed: { color: 'bg-orange-500', icon: AlertCircle },
  };

  const config = statusConfig[challenge.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const opponentName = opponent?.display_name || opponent?.username || 'Unknown';

  return (
    <Link to={`/challenges/${challenge.id}`} className="card group hover:border-gaming-electric-500/50 transition-all">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-gaming-dark-600 overflow-hidden">
            {opponent?.avatar_url ? (
              <img src={opponent.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {opponent?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
            <StatusIcon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">
              {challenge.status === 'pending' && !isChallenger
                ? challengedYouFmt(opponentName)
                : vsFmt(opponentName)}
            </h3>
            <span className={`badge text-xs ${config.color}/20 text-white`}>
              {statusLabels[challenge.status] || challenge.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(challenge.created_at).toLocaleDateString()}
            </span>
            <span className="font-semibold text-gaming-neon-yellow">
              {challenge.credits_amount} {credits}
            </span>
            <span className="hidden sm:inline">{challenge.platform}</span>
          </div>
        </div>

        {challenge.status === 'pending' && !isChallenger && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-gaming-electric-500 font-medium">
              {respondLabel}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gaming-electric-500 transition-colors" />
          </div>
        )}
        {challenge.status !== 'pending' && (
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gaming-electric-500 transition-colors" />
        )}
      </div>
    </Link>
  );
}
