import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { Season } from '../types/database';
import type { SeasonRank } from '../types/database';
import {
  Trophy,
  TrendingUp,
  Flame,
  Target,
  Crown,
  Medal,
} from 'lucide-react';

const RANK_THRESHOLDS: Record<SeasonRank, { points: number; icon: string }> = {
  Bronze: { points: 0, icon: '🥉' },
  Argent: { points: 100, icon: '🥈' },
  Or: { points: 300, icon: '🥇' },
  Diamant: { points: 600, icon: '💎' },
  Maitre: { points: 1000, icon: '👑' },
};

const RANK_ORDER: SeasonRank[] = ['Bronze', 'Argent', 'Or', 'Diamant', 'Maitre'];

export function SeasonScreen() {
  const { profile } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchSeasons();
    }
  }, [profile]);

  const fetchSeasons = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('seasons')
      .select('*')
      .eq('user_id', profile.id)
      .order('season_number', { ascending: false });

    if (data) {
      setSeasons(data);
    }
    setLoading(false);
  };

  const getCurrentSeason = () => {
    return seasons.find((s) => s.season_number === getCurrentSeasonNumber());
  };

  const getCurrentSeasonNumber = () => {
    const startDate = new Date('2024-01-01');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  };

  const getNextRank = () => {
    if (!profile) return null;

    const currentRank = profile.season_rank;
    const currentIndex = RANK_ORDER.indexOf(currentRank);

    if (currentIndex === -1 || currentIndex === RANK_ORDER.length - 1) {
      return null;
    }

    return RANK_ORDER[currentIndex + 1];
  };

  const nextRank = getNextRank();
  const pointsToNextRank = nextRank
    ? RANK_THRESHOLDS[nextRank].points - (profile?.season_points || 0)
    : 0;

  const progressPercentage = () => {
    if (!profile || !nextRank) return 100;

    const currentThreshold = RANK_THRESHOLDS[profile.season_rank].points;
    const nextThreshold = RANK_THRESHOLDS[nextRank].points;

    return Math.min(
      100,
      ((profile.season_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    );
  };

  return (
    <div className="pb-24">
      <div className="px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Saison {getCurrentSeasonNumber()}</h1>

        {profile && (
          <Card className="bg-gradient-to-br from-primary-600/20 to-primary-800/20 border-primary-500/30">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center bg-slate-800 rounded-full p-6">
                <div className="text-6xl">
                  {RANK_THRESHOLDS[profile.season_rank].icon}
                </div>
              </div>

              <div>
                <Badge rank={profile.season_rank} />
                <p className="text-3xl font-bold text-white mt-2">
                  {profile.season_points} points
                </p>
              </div>

              {nextRank && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{profile.season_rank}</span>
                    <span className="text-slate-400">{nextRank}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage()}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {pointsToNextRank} points jusqu'au prochain rang
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-gold-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profile.wins}</p>
                  <p className="text-xs text-slate-400">Victoires</p>
                </div>
                <div className="text-center">
                  <Target className="w-6 h-6 text-error-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profile.losses}</p>
                  <p className="text-xs text-slate-400">Défaites</p>
                </div>
                <div className="text-center">
                  <Flame className="w-6 h-6 text-accent-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profile.current_streak}</p>
                  <p className="text-xs text-slate-400">Série</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold-500" />
            Rangs de la saison
          </h3>

          <div className="space-y-3">
            {[...RANK_ORDER].reverse().map((rank) => {
              const threshold = RANK_THRESHOLDS[rank];
              const isCurrentRank = profile?.season_rank === rank;
              const isAchieved = (profile?.season_points || 0) >= threshold.points;

              return (
                <Card
                  key={rank}
                  className={`${
                    isCurrentRank
                      ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 border-primary-500/40'
                      : isAchieved
                      ? 'bg-slate-800/50'
                      : 'bg-slate-800/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{threshold.icon}</div>
                    <div className="flex-1">
                      <p className={`font-semibold ${isCurrentRank ? 'text-primary-400' : 'text-white'}`}>
                        {rank}
                      </p>
                      <p className="text-sm text-slate-400">{threshold.points}+ points</p>
                    </div>
                    {isCurrentRank && (
                      <div className="bg-primary-500 rounded-full px-3 py-1">
                        <span className="text-xs font-semibold text-white">Actuel</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {seasons.length > 1 && (
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-slate-400" />
              Saisons précédentes
            </h3>

            <div className="space-y-2">
              {seasons.slice(1).map((season) => (
                <Card key={season.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Saison {season.season_number}</p>
                    <Badge rank={season.rank} />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{season.points} pts</p>
                    <p className="text-xs text-slate-400">
                      {season.wins}W - {season.losses}L
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
