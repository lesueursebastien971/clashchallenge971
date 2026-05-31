import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Avatar, Badge } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { Challenge, User } from '../types/database';
import {
  Swords,
  Trophy,
  TrendingUp,
  Clock,
  Flame,
  ChevronRight,
  Target,
  Users,
} from 'lucide-react';

interface HomeScreenProps {
  onCreateChallenge: () => void;
  onViewChallenge: (challengeId: string) => void;
}

export function HomeScreen({ onCreateChallenge, onViewChallenge }: HomeScreenProps) {
  const { profile } = useAuth();
  const [recentChallenges, setRecentChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchRecentChallenges();
    }
  }, [profile]);

  const fetchRecentChallenges = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:users!challenges_challenger_id_fkey (*),
        opponent:users!challenges_opponent_id_fkey (*)
      `)
      .or(`challenger_id.eq.${profile.id},opponent_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentChallenges(data);
    }
    setLoading(false);
  };

  const winRate = profile && profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0;

  return (
    <div className="pb-24">
      <div className="px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Pret a defier ?</h1>
          <p className="text-slate-400">Lancez un defi en moins de 30 secondes</p>
        </div>

        <Button
          onClick={onCreateChallenge}
          className="w-full group relative overflow-hidden"
          size="lg"
          variant="accent"
          icon={<Swords className="w-6 h-6" />}
        >
          <span className="relative z-10">Defi Rapide</span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>

        {profile && (
          <Card className="bg-gradient-to-br from-primary-600/20 to-primary-800/20 border-primary-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold-500" />
                Progression Saison
              </h3>
              <Badge rank={profile.season_rank} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Points</span>
                <span className="font-bold text-white">{profile.season_points}</span>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((profile.season_points / 100) * 100, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.wins}</p>
                  <p className="text-xs text-slate-400">Victoires</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.losses}</p>
                  <p className="text-xs text-slate-400">Defaites</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-400">{winRate}%</p>
                  <p className="text-xs text-slate-400">Win Rate</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {profile && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-success-500/20 rounded-xl p-2">
                  <Flame className="w-6 h-6 text-success-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile.current_streak}</p>
                  <p className="text-xs text-slate-400">Serie actuelle</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-accent-500/20 rounded-xl p-2">
                  <Target className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile.total_challenges}</p>
                  <p className="text-xs text-slate-400">Defis totaux</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Activité récente
            </h3>
            {recentChallenges.length > 0 && (
              <button className="text-sm text-primary-400 hover:text-primary-300">
                Voir tout
              </button>
            )}
          </div>

          {loading ? (
            <Card className="text-center py-8">
              <p className="text-slate-500">Chargement...</p>
            </Card>
          ) : recentChallenges.length === 0 ? (
            <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Aucun défi pour le moment</p>
              <p className="text-sm text-slate-600 mt-1">Lancez votre premier défi !</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  currentUserId={profile?.id || ''}
                  onClick={() => onViewChallenge(challenge.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId: string;
  onClick: () => void;
}

function ChallengeCard({ challenge, currentUserId, onClick }: ChallengeCardProps) {
  const isChallenger = challenge.challenger_id === currentUserId;
  const opponent = isChallenger ? challenge.opponent : challenge.challenger;
  const statusColors: Record<string, string> = {
    pending: 'bg-warning-500/20 text-warning-400',
    accepted: 'bg-success-500/20 text-success-400',
    in_progress: 'bg-primary-500/20 text-primary-400',
    completed: 'bg-slate-500/20 text-slate-400',
    declined: 'bg-error-500/20 text-error-400',
    expired: 'bg-slate-600/20 text-slate-500',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Accepte',
    in_progress: 'En cours',
    completed: 'Termine',
    declined: 'Refuse',
    expired: 'Expire',
  };

  return (
    <Card interactive onClick={onClick} className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar src={opponent?.avatar_url} size="sm" />
        <div>
          <p className="font-medium text-white">{opponent?.username || 'En attente...'}</p>
          <p className="text-sm text-slate-400">{challenge.stake_amount} coins en jeu</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[challenge.status]}`}>
          {statusLabels[challenge.status]}
        </span>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>
    </Card>
  );
}
