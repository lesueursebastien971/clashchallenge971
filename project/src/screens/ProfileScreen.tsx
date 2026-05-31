import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button, Avatar } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { Season, Match, Challenge } from '../types/database';
import {
  Trophy,
  TrendingUp,
  Flame,
  Swords,
  Settings,
  LogOut,
  Edit2,
  Crown,
  Target,
} from 'lucide-react';

interface ProfileScreenProps {
  onSettings: () => void;
}

export function ProfileScreen({ onSettings }: ProfileScreenProps) {
  const { profile, signOut, refreshProfile } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [recentMatches, setRecentMatches] = useState<(Match & { challenge: Challenge })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchProfileData();
    }
  }, [profile]);

  const fetchProfileData = async () => {
    if (!profile) return;

    const [seasonsRes, matchesRes] = await Promise.all([
      supabase
        .from('seasons')
        .select('*')
        .eq('user_id', profile.id)
        .order('season_number', { ascending: false })
        .limit(3),
      supabase
        .from('matches')
        .select(`
          *,
          challenge:challenges (
            *,
            challenger:users!challenges_challenger_id_fkey (*),
            opponent:users!challenges_opponent_id_fkey (*)
          )
        `)
        .or(`winner_id.eq.${profile.id},loser_id.eq.${profile.id}`)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10),
    ]);

    if (seasonsRes.data) setSeasons(seasonsRes.data);
    if (matchesRes.data) setRecentMatches(matchesRes.data);

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!profile) return null;

  const winRate = profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0;

  return (
    <div className="pb-24">
      <div className="px-4 py-6 space-y-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
          <button
            onClick={onSettings}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar src={profile.avatar_url} size="lg" />
              <button className="absolute -bottom-2 -right-2 bg-primary-600 rounded-full p-2 hover:bg-primary-700 transition-colors">
                <Edit2 className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{profile.username}</h2>
                {profile.clash_royale_tag && (
                  <span className="text-xs bg-slate-700 rounded px-2 py-1 text-slate-300">
                    {profile.clash_royale_tag}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge rank={profile.season_rank} />
                <span className="text-sm text-slate-400">Niveau {profile.level}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{profile.wins}</p>
              <p className="text-xs text-slate-400 mt-1">Victoires</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{profile.losses}</p>
              <p className="text-xs text-slate-400 mt-1">Défaites</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success-400">{winRate}%</p>
              <p className="text-xs text-slate-400 mt-1">Win Rate</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-accent-500/10 to-accent-600/10 border-accent-500/30">
            <div className="flex items-center gap-3">
              <div className="bg-accent-500/20 rounded-xl p-2">
                <Trophy className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{profile.best_streak}</p>
                <p className="text-xs text-slate-400">Meilleure série</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 border-primary-500/30">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500/20 rounded-xl p-2">
                <Swords className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{profile.total_challenges}</p>
                <p className="text-xs text-slate-400">Défis totaux</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold-500" />
            Historique des saisons
          </h3>

          {seasons.length === 0 ? (
            <Card className="text-center py-6 bg-slate-800/30">
              <p className="text-slate-500">Première saison en cours</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {seasons.map((season) => (
                <Card key={season.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge rank={season.rank} />
                    <div>
                      <p className="font-medium text-white">Saison {season.season_number}</p>
                      <p className="text-sm text-slate-400">{season.points} points</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{season.wins}W - {season.losses}L</p>
                    <p className="text-xs text-slate-400">Max: {season.best_streak}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            Matchs récents
          </h3>

          {recentMatches.length === 0 ? (
            <Card className="text-center py-6 bg-slate-800/30">
              <p className="text-slate-500">Aucun match terminé</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentMatches.slice(0, 5).map((match) => {
                const isWinner = match.winner_id === profile.id;
                const opponent = match.challenge.challenger_id === profile.id
                  ? match.challenge.opponent
                  : match.challenge.challenger;

                return (
                  <Card key={match.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isWinner ? 'bg-success-500' : 'bg-error-500'}`} />
                      <div>
                        <p className="font-medium text-white text-sm">
                          vs {opponent?.username || 'Inconnu'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {match.challenge.stake_amount} coins
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${isWinner ? 'text-success-400' : 'text-error-400'}`}>
                      {isWinner ? 'Victoire' : 'Défaite'}
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full"
          icon={<LogOut className="w-5 h-5" />}
        >
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
