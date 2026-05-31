import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Avatar, Badge, Input } from '../ui';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types/database';
import {
  Coins,
  Swords,
  Users,
  Search,
  Share2,
  Copy,
  CheckCircle,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface CreateChallengeModalProps {
  onClose: () => void;
  onComplete: (challengeId: string) => void;
  preselectedFriendId?: string;
}

type Step = 'stake' | 'opponent' | 'code';

export function CreateChallengeModal({
  onClose,
  onComplete,
  preselectedFriendId,
}: CreateChallengeModalProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState<Step>('stake');
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [opponentType, setOpponentType] = useState<'friend' | 'random'>('friend');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(preselectedFriendId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<(User & { friendship_id: string })[]>([]);
  const [challengeCode, setChallengeCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (step === 'opponent' && opponentType === 'friend') {
      fetchFriends();
    }
  }, [step, opponentType]);

  const fetchFriends = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('friends')
      .select(`
        id,
        friend:users!friends_friend_id_fkey (*)
      `)
      .eq('user_id', profile.id)
      .eq('status', 'accepted');

    if (data) {
      setFriends(data.map(f => ({ ...f.friend, friendship_id: f.id })));
    }
  };

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNextStep = () => {
    if (step === 'stake') {
      setStep('opponent');
    } else if (step === 'opponent') {
      createChallenge();
    }
  };

  const createChallenge = async () => {
    if (!profile) return;
    setLoading(true);

    const code = generateChallengeCode();

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        challenger_id: profile.id,
        opponent_id: opponentType === 'friend' ? selectedFriendId : null,
        stake_amount: stakeAmount,
        challenge_code: code,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setChallengeCode(code);
      setStep('code');

      if (opponentType === 'friend' && selectedFriendId) {
        await supabase.from('notifications').insert({
          user_id: selectedFriendId,
          type: 'challenge_received',
          title: 'Nouveau défi !',
          message: `${profile.username} vous a défié pour ${stakeAmount} coins`,
          data: { challenge_id: data.id },
        });
      }
    }

    setLoading(false);
  };

  const generateChallengeCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyChallengeCode = async () => {
    const text = `Duel Clash Challenge ! 🎮
Utilise le code: ${challengeCode}
Mise: ${stakeAmount} coins
Rejoins l'arène: https://clasharena.app/duel/${challengeCode}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareChallenge = async () => {
    const shareData = {
      title: 'Clash Challenge',
      text: `Défi accepté ! 🎮 Code: ${challengeCode} - Mise: ${stakeAmount} coins`,
      url: `https://clasharena.app/duel/${challengeCode}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyChallengeCode();
      }
    } else {
      copyChallengeCode();
    }
  };

  const canProceed = () => {
    if (step === 'stake') return stakeAmount <= (profile?.coins || 0);
    if (step === 'opponent') {
      if (opponentType === 'friend') return !!selectedFriendId;
      return true;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <Card className="w-full max-w-lg mx-4 mb-0 sm:mb-4 sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 pt-4 pb-4 border-b border-slate-700 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {step === 'stake' && 'Choisir la mise'}
              {step === 'opponent' && 'Choisir l\'adversaire'}
              {step === 'code' && 'Défi créé !'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {step !== 'code' && (
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex-1 h-1 rounded-full ${step === 'stake' ? 'bg-primary-500' : 'bg-slate-700'}`} />
              <div className={`flex-1 h-1 rounded-full ${step === 'opponent' ? 'bg-primary-500' : 'bg-slate-700'}`} />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {step === 'stake' && (
            <>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Votre solde</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-accent-400" />
                    <span className="font-bold text-white">{profile?.coins.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[100, 250, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setStakeAmount(amount)}
                    disabled={amount > (profile?.coins || 0)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      stakeAmount === amount
                        ? 'border-primary-500 bg-primary-500/10'
                        : amount > (profile?.coins || 0)
                        ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <Coins className={`w-8 h-8 mx-auto mb-2 ${stakeAmount === amount ? 'text-primary-400' : 'text-slate-400'}`} />
                    <p className={`text-2xl font-bold ${stakeAmount === amount ? 'text-primary-400' : 'text-white'}`}>
                      {amount}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'opponent' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setOpponentType('friend');
                    setSelectedFriendId(null);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center ${
                    opponentType === 'friend'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <Users className={`w-8 h-8 mb-2 ${opponentType === 'friend' ? 'text-primary-400' : 'text-slate-400'}`} />
                  <p className={`font-semibold ${opponentType === 'friend' ? 'text-primary-400' : 'text-white'}`}>
                    Un ami
                  </p>
                </button>

                <button
                  onClick={() => {
                    setOpponentType('random');
                    setSelectedFriendId(null);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center ${
                    opponentType === 'random'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <Zap className={`w-8 h-8 mb-2 ${opponentType === 'random' ? 'text-primary-400' : 'text-slate-400'}`} />
                  <p className={`font-semibold ${opponentType === 'random' ? 'text-primary-400' : 'text-white'}`}>
                    Aléatoire
                  </p>
                </button>
              </div>

              {opponentType === 'friend' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Rechercher un ami..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12"
                    />
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredFriends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => setSelectedFriendId(friend.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          selectedFriendId === friend.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        }`}
                      >
                        <Avatar src={friend.avatar_url} size="sm" />
                        <div className="flex-1 text-left">
                          <p className={`font-medium ${selectedFriendId === friend.id ? 'text-primary-400' : 'text-white'}`}>
                            {friend.username}
                          </p>
                          <p className="text-xs text-slate-400">
                            {friend.wins}W - {friend.losses}L
                          </p>
                        </div>
                        {selectedFriendId === friend.id && (
                          <CheckCircle className="w-6 h-6 text-primary-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {opponentType === 'random' && (
                <Card className="bg-gradient-to-br from-accent-500/10 to-primary-500/10 border-accent-500/30 text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-3 text-accent-400" />
                  <p className="text-white font-medium">Matchmaking aléatoire</p>
                  <p className="text-sm text-slate-400 mt-1">
                    N'importe qui pourra rejoindre votre défi
                  </p>
                </Card>
              )}
            </>
          )}

          {step === 'code' && (
            <>
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center bg-success-500/20 rounded-full p-4">
                  <CheckCircle className="w-16 h-16 text-success-400" />
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Code du défi</p>
                  <div className="bg-slate-700 rounded-xl px-6 py-4">
                    <p className="text-4xl font-mono font-bold text-primary-400 tracking-wider">
                      {challengeCode}
                    </p>
                  </div>
                </div>

                <Card className="bg-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mise</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-accent-400" />
                      <span className="font-bold text-white">{stakeAmount}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-600 my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Adversaire</span>
                    <span className="font-medium text-white">
                      {opponentType === 'random'
                        ? 'Aléatoire'
                        : friends.find(f => f.id === selectedFriendId)?.username || 'Ami'}
                    </span>
                  </div>
                </Card>

                <div className="text-sm text-slate-500">
                  Expire dans 30 minutes
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={shareChallenge}
                  className="w-full"
                  icon={<Share2 className="w-5 h-5" />}
                >
                  Partager le défi
                </Button>

                <Button
                  onClick={copyChallengeCode}
                  variant="secondary"
                  className="w-full"
                  icon={copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                >
                  {copied ? 'Copié !' : 'Copier le code'}
                </Button>
              </div>
            </>
          )}
        </div>

        {step !== 'code' && (
          <div className="sticky bottom-0 bg-slate-800 p-4 border-t border-slate-700">
            <div className="flex gap-3">
              {step === 'opponent' && (
                <Button
                  onClick={() => setStep('stake')}
                  variant="ghost"
                  className="flex-1"
                >
                  Retour
                </Button>
              )}
              <Button
                onClick={handleNextStep}
                disabled={!canProceed() || loading}
                loading={loading}
                className="flex-1"
                icon={<ChevronRight className="w-5 h-5" />}
              >
                {step === 'stake' ? 'Suivant' : 'Créer le défi'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
