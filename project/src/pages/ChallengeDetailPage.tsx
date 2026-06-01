import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Swords,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Gamepad2,
  Monitor,
  CreditCard,
  Upload,
  ChevronLeft,
  AlertCircle,
  Trophy,
  Loader2,
} from 'lucide-react';
import type { Challenge, ChallengeResult, Game, Profile } from '../types/database';

interface FullChallenge extends Challenge {
  game: Game;
  challenger: Profile;
  opponent: Profile;
  result?: ChallengeResult;
}

export function ChallengeDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<FullChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenge();
  }, [id]);

  async function loadChallenge() {
    if (!id) return;

    const { data, error } = await supabase
      .from('challenges')
      .select('*, game:games(*), challenger:profiles!challenger_id(*), opponent:profiles!opponent_id(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading challenge:', error);
    } else if (data) {
      const { data: result } = await supabase
        .from('challenge_results')
        .select('*')
        .eq('challenge_id', id)
        .maybeSingle();
      setChallenge({ ...data, result: result || undefined });
    }
    setLoading(false);
  }

  const isChallenger = challenge?.challenger_id === profile?.user_id;
  const isOpponent = challenge?.opponent_id === profile?.user_id;
  const canRespond = challenge?.status === 'pending' && isOpponent;
  const canSubmitResult = challenge?.status === 'accepted' || challenge?.status === 'in_progress';

  async function handleAccept() {
    setActionLoading(true);
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'accepted' })
      .eq('id', challenge?.id);
    if (error) setError(error.message);
    else await loadChallenge();
    setActionLoading(false);
  }

  async function handleDecline() {
    setActionLoading(true);
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'declined' })
      .eq('id', challenge?.id);
    if (error) setError(error.message);
    else navigate('/challenges');
    setActionLoading(false);
  }

  async function handleSubmitResult(won: boolean) {
    setActionLoading(true);
    setError(null);

    try {
      const { error: resultError } = await supabase.from('challenge_results').insert({
        challenge_id: challenge?.id,
        winner_id: won ? profile?.user_id : (isChallenger ? challenge?.opponent_id : challenge?.challenger_id),
        loser_id: won ? (isChallenger ? challenge?.opponent_id : challenge?.challenger_id) : profile?.user_id,
        reported_by: profile?.user_id,
      });

      if (resultError) throw resultError;

      const { error: updateError } = await supabase
        .from('challenges')
        .update({ status: 'completed' })
        .eq('id', challenge?.id);

      if (updateError) throw updateError;

      await loadChallenge();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit result');
    }
    setActionLoading(false);
  }

  const statusConfig = {
    pending: { color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'Pending Response' },
    accepted: { color: 'text-gaming-neon-blue', bg: 'bg-gaming-neon-blue/20', label: 'Accepted' },
    declined: { color: 'text-gaming-neon-red', bg: 'bg-gaming-neon-red/20', label: 'Declined' },
    in_progress: { color: 'text-gaming-neon-green', bg: 'bg-gaming-neon-green/20', label: 'In Progress' },
    completed: { color: 'text-gaming-electric-500', bg: 'bg-gaming-electric-500/20', label: 'Completed' },
    cancelled: { color: 'text-gray-500', bg: 'bg-gray-500/20', label: 'Cancelled' },
    disputed: { color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Disputed' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-gaming-electric-500 animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Challenge not found</h2>
        <button onClick={() => navigate('/challenges')} className="btn btn-primary mt-4">
          Back to Challenges
        </button>
      </div>
    );
  }

  const status = statusConfig[challenge.status];
  const opponent = isChallenger ? challenge.opponent : challenge.challenger;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/challenges')} className="flex items-center gap-2 text-gray-400 hover:text-white">
        <ChevronLeft className="w-5 h-5" />
        Back to Challenges
      </button>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl ${status.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {challenge.status === 'pending' ? (
            <Clock className={`w-6 h-6 ${status.color}`} />
          ) : challenge.status === 'completed' ? (
            <CheckCircle className={`w-6 h-6 ${status.color}`} />
          ) : challenge.status === 'declined' ? (
            <XCircle className={`w-6 h-6 ${status.color}`} />
          ) : (
            <Swords className={`w-6 h-6 ${status.color}`} />
          )}
          <span className={`font-semibold ${status.color}`}>{status.label}</span>
        </div>
        {challenge.status === 'pending' && (
          <span className="text-sm text-gray-400">
            Expires {new Date(challenge.expires_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Players */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gaming-dark-600 overflow-hidden mb-3">
              {(isChallenger ? profile?.avatar_url : challenge.challenger.avatar_url) ? (
                <img
                  src={(isChallenger ? profile?.avatar_url : challenge.challenger.avatar_url) || ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
              )}
            </div>
            <p className="font-semibold text-white">
              {isChallenger ? profile?.display_name : challenge.challenger.display_name}
            </p>
            <p className="text-sm text-gray-400">
              {isChallenger ? '@' + profile?.username : '@' + challenge.challenger.username}
            </p>
            {isChallenger && (
              <span className="badge-primary text-xs mt-2">You</span>
            )}
          </div>

          <div className="flex flex-col items-center">
            <Swords className="w-8 h-8 text-gaming-electric-500" />
            <span className="text-xl font-bold text-gaming-neon-yellow mt-2">
              {challenge.credits_amount}
            </span>
            <span className="text-xs text-gray-500">credits</span>
          </div>

          <div className="flex-1 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gaming-dark-600 overflow-hidden mb-3">
              {(isOpponent ? profile?.avatar_url : challenge.opponent.avatar_url) ? (
                <img
                  src={(isOpponent ? profile?.avatar_url : challenge.opponent.avatar_url) || ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
              )}
            </div>
            <p className="font-semibold text-white">
              {isOpponent ? profile?.display_name : challenge.opponent.display_name}
            </p>
            <p className="text-sm text-gray-400">
              {isOpponent ? '@' + profile?.username : '@' + challenge.opponent.username}
            </p>
            {isOpponent && (
              <span className="badge-primary text-xs mt-2">You</span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gaming-electric-500/20 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-gaming-electric-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Game</p>
              <p className="font-semibold text-white">{challenge.game.name}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gaming-neon-blue/20 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-gaming-neon-blue" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Platform</p>
              <p className="font-semibold text-white">{challenge.platform}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gaming-neon-yellow/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gaming-neon-yellow" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Wager</p>
              <p className="font-semibold text-white">{challenge.credits_amount} credits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {challenge.result && (
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-3">Result</h3>
          <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-gaming-dark-700">
            {challenge.result.winner_id === profile?.user_id ? (
              <>
                <Trophy className="w-12 h-12 text-gaming-neon-yellow" />
                <div>
                  <p className="text-2xl font-bold text-gaming-neon-green">Victory!</p>
                  <p className="text-gray-400">You won {challenge.credits_amount} credits</p>
                </div>
              </>
            ) : challenge.result.is_draw ? (
              <>
                <Swords className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-2xl font-bold text-white">Draw</p>
                  <p className="text-gray-400">No credits exchanged</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-gaming-neon-red" />
                <div>
                  <p className="text-2xl font-bold text-gaming-neon-red">Defeat</p>
                  <p className="text-gray-400">You lost {challenge.credits_amount} credits</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {canRespond && (
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Do you accept this challenge?</h3>
          <div className="flex gap-3">
            <button onClick={handleAccept} disabled={actionLoading} className="btn btn-neon flex-1 py-3">
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Challenge'}
            </button>
            <button onClick={handleDecline} disabled={actionLoading} className="btn btn-secondary py-3">
              Decline
            </button>
          </div>
        </div>
      )}

      {canSubmitResult && !challenge.result && (
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Submit Result</h3>
          <p className="text-gray-400 mb-4">Did you win this match?</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmitResult(true)}
              disabled={actionLoading}
              className="btn bg-gaming-neon-green hover:bg-gaming-neon-green/90 text-gaming-dark-900 flex-1 py-3"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'I Won'}
            </button>
            <button
              onClick={() => handleSubmitResult(false)}
              disabled={actionLoading}
              className="btn bg-gaming-neon-red hover:bg-gaming-neon-red/90 text-white flex-1 py-3"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'I Lost'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-gaming-neon-red/10 border border-gaming-neon-red/30 text-gaming-neon-red">
          {error}
        </div>
      )}
    </div>
  );
}
