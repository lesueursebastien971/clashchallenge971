import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Avatar, Badge } from '../ui';
import { supabase } from '../../lib/supabase';
import type { Challenge, Match } from '../../types/database';
import {
  Swords,
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  ChevronRight,
  Trophy,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

interface ChallengeDetailScreenProps {
  challengeId: string;
  onBack: () => void;
  onUploadResult: (matchId: string) => void;
}

export function ChallengeDetailScreen({
  challengeId,
  onBack,
  onUploadResult,
}: ChallengeDetailScreenProps) {
  const { profile } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  const fetchChallenge = async () => {
    const { data } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:users!challenges_challenger_id_fkey (*),
        opponent:users!challenges_opponent_id_fkey (*)
      `)
      .eq('id', challengeId)
      .maybeSingle();

    if (data) {
      setChallenge(data);

      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('challenge_id', data.id)
        .maybeSingle();

      if (matchData) {
        setMatch(matchData);
      }
    }

    setLoading(false);
  };

  const isChallenger = challenge?.challenger_id === profile?.id;
  const opponent = isChallenger ? challenge?.opponent : challenge?.challenger;

  const handleAcceptChallenge = async () => {
    if (!challenge || !profile) return;
    setActionLoading(true);

    const { error } = await supabase
      .from('challenges')
      .update({ status: 'accepted' })
      .eq('id', challenge.id);

    if (!error) {
      await supabase.from('matches').insert({
        challenge_id: challenge.id,
        status: 'pending',
      });

      await supabase.from('notifications').insert({
        user_id: challenge.challenger_id,
        type: 'challenge_accepted',
        title: 'Défi accepté !',
        message: `${profile.username} a accepté votre défi`,
        data: { challenge_id: challenge.id },
      });

      fetchChallenge();
    }

    setActionLoading(false);
  };

  const handleDeclineChallenge = async () => {
    if (!challenge) return;
    setActionLoading(true);

    const { error } = await supabase
      .from('challenges')
      .update({ status: 'declined' })
      .eq('id', challenge.id);

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: challenge.challenger_id,
        type: 'challenge_declined',
        title: 'Défi refusé',
        message: `Le défi a été refusé`,
        data: { challenge_id: challenge.id },
      });

      onBack();
    }

    setActionLoading(false);
  };

  const handleMarkInProgress = async () => {
    if (!challenge || !match) return;

    await supabase
      .from('challenges')
      .update({ status: 'in_progress' })
      .eq('id', challenge.id);
  };

  const timeUntilExpiry = () => {
    if (!challenge) return '';
    const expiry = new Date(challenge.expires_at);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expiré';

    const minutes = Math.floor(diff / 60000);
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">Défi non trouvé</p>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'bg-warning-500/20 text-warning-400', label: 'En attente', icon: Clock },
    accepted: { color: 'bg-success-500/20 text-success-400', label: 'Accepté', icon: CheckCircle },
    declined: { color: 'bg-error-500/20 text-error-400', label: 'Refusé', icon: XCircle },
    expired: { color: 'bg-slate-600/20 text-slate-500', label: 'Expiré', icon: AlertCircle },
    in_progress: { color: 'bg-primary-500/20 text-primary-400', label: 'En cours', icon: Swords },
    completed: { color: 'bg-slate-500/20 text-slate-400', label: 'Terminé', icon: Trophy },
  };

  const config = statusConfig[challenge.status];
  const StatusIcon = config.icon;

  return (
    <div className="pb-24 space-y-6 px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        <span>Retour</span>
      </button>

      <Card className="bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex items-center justify-between mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </span>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{timeUntilExpiry()}</span>
          </div>
        </div>

        <div className="flex items-center justify-around py-6">
          <div className="text-center">
            <Avatar
              src={isChallenger ? profile?.avatar_url : challenge.challenger?.avatar_url}
              size="lg"
            />
            <p className="font-bold text-white mt-3">
              {isChallenger ? profile?.username : challenge.challenger?.username}
            </p>
            {isChallenger && <p className="text-xs text-primary-400">Vous</p>}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-accent-500/20 rounded-xl px-4 py-2">
              <Coins className="w-6 h-6 text-accent-400" />
            </div>
            <p className="text-2xl font-bold text-white">{challenge.stake_amount}</p>
          </div>

          <div className="text-center">
            <Avatar src={opponent?.avatar_url} size="lg" />
            <p className="font-bold text-white mt-3">
              {opponent?.username || 'En attente...'}
            </p>
            {!isChallenger && <p className="text-xs text-primary-400">Vous</p>}
          </div>
        </div>
      </Card>

      {challenge.status === 'pending' && !isChallenger && (
        <div className="space-y-3">
          <Button
            onClick={handleAcceptChallenge}
            loading={actionLoading}
            className="w-full"
            size="lg"
            icon={<CheckCircle className="w-5 h-5" />}
          >
            Accepter le défi
          </Button>
          <Button
            onClick={handleDeclineChallenge}
            variant="ghost"
            className="w-full"
            icon={<XCircle className="w-5 h-5" />}
          >
            Refuser
          </Button>
        </div>
      )}

      {challenge.status === 'accepted' && match && (
        <Card className="bg-primary-500/10 border-primary-500/30">
          <div className="text-center space-y-4">
            <Swords className="w-12 h-12 mx-auto text-primary-400" />
            <div>
              <p className="font-semibold text-white text-lg">Le match peut commencer !</p>
              <p className="text-sm text-slate-400 mt-1">
                Jouez votre combat amical dans Clash Royale
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Niveau de cartes plafonné à 11 pour l'équité
            </div>
          </div>
        </Card>
      )}

      {challenge.status === 'in_progress' && match && !match.winner_id && (
        <div className="space-y-3">
          <Button
            onClick={() => onUploadResult(match.id)}
            className="w-full"
            size="lg"
            icon={<Upload className="w-5 h-5" />}
          >
            Déclarer ma victoire
          </Button>
          <p className="text-xs text-center text-slate-500">
            Uploadez une capture d'écran du résultat
          </p>
        </div>
      )}

      {match?.winner_id && (
        <Card className="bg-gradient-to-br from-success-500/10 to-success-600/10 border-success-500/30">
          <div className="text-center space-y-3">
            <Trophy className="w-12 h-12 mx-auto text-gold-500" />
            <p className="font-bold text-white text-lg">
              {match.winner_id === profile?.id ? 'Victoire !' : 'Défaite'}
            </p>
            <p className="text-sm text-slate-400">
              {match.winner_id === profile?.id
                ? `+${challenge.stake_amount} coins gagnés`
                : `-${challenge.stake_amount} coins perdus`}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
