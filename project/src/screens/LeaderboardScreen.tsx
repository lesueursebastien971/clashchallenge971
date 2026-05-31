import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Avatar, Badge } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { User, LeaderboardEntry } from '../types/database';
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  ChevronUp,
  Users,
  Globe,
} from 'lucide-react';

type LeaderboardTab = 'global' | 'friends';

export function LeaderboardScreen() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, profile]);

  const fetchLeaderboard = async () => {
    if (!profile) return;
    setLoading(true);

    if (activeTab === 'global') {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, season_rank, season_points, wins, losses, current_streak')
        .order('season_points', { ascending: false })
        .limit(50);

      if (!error && data) {
        const entries: LeaderboardEntry[] = data.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));
        setLeaderboard(entries);

        const rank = data.findIndex(u => u.id === profile.id);
        setUserRank(rank !== -1 ? rank + 1 : null);
      }
    } else {
      const { data: friendships } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', profile.id)
        .eq('status', 'accepted');

      const friendIds = friendships?.map(f => f.friend_id) || [];
      friendIds.push(profile.id);

      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, season_rank, season_points, wins, losses, current_streak')
        .in('id', friendIds)
        .order('season_points', { ascending: false });

      if (!error && data) {
        const entries: LeaderboardEntry[] = data.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));
        setLeaderboard(entries);

        const rank = data.findIndex(u => u.id === profile.id);
        setUserRank(rank !== -1 ? rank + 1 : null);
      }
    }

    setLoading(false);
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-gold-500';
    if (rank === 2) return 'text-slate-300';
    if (rank === 3) return 'text-bronze-500';
    return 'text-slate-500';
  };

  return (
    <div className="pb-24">
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Classement</h1>

          {userRank && (
            <div className="flex items-center gap-2 bg-primary-500/20 rounded-lg px-3 py-1">
              <ChevronUp className="w-4 h-4 text-primary-400" />
              <span className="font-bold text-primary-400">#{userRank}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activeTab === 'global'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">Global</span>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activeTab === 'friends'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Amis</span>
          </button>
        </div>

        {loading ? (
          <Card className="text-center py-8">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : leaderboard.length === 0 ? (
          <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">
              {activeTab === 'global'
                ? 'Aucun joueur classé'
                : 'Ajoutez des amis pour voir le classement'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <LeaderboardTopCard
                key={entry.id}
                entry={entry}
                rank={index + 1}
                isCurrentUser={entry.id === profile?.id}
              />
            ))}

            {leaderboard.length > 3 && (
              <div className="space-y-2 mt-4">
                {leaderboard.slice(3).map((entry, index) => {
                  const rank = index + 4;
                  const isCurrentUser = entry.id === profile?.id;

                  return (
                    <Card
                      key={entry.id}
                      className={`flex items-center gap-4 ${
                        isCurrentUser ? 'bg-primary-500/10 border-primary-500/30' : ''
                      }`}
                    >
                      <div className="w-8 text-center">
                        <span className={`font-bold ${getRankStyle(rank)}`}>
                          {rank}
                        </span>
                      </div>

                      <Avatar src={entry.avatar_url} size="sm" />

                      <div className="flex-1">
                        <p className={`font-medium ${isCurrentUser ? 'text-primary-400' : 'text-white'}`}>
                          {entry.username}
                          {isCurrentUser && <span className="text-xs ml-2">(Vous)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge rank={entry.season_rank} />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-white">{entry.season_points}</p>
                        <p className="text-xs text-slate-400">
                          {entry.wins}W - {entry.losses}L
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface LeaderboardTopCardProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}

function LeaderboardTopCard({ entry, rank, isCurrentUser }: LeaderboardTopCardProps) {
  const bgStyles = {
    1: 'bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-gold-500/40',
    2: 'bg-gradient-to-br from-slate-400/20 to-slate-500/10 border-slate-400/40',
    3: 'bg-gradient-to-br from-bronze-500/20 to-bronze-600/10 border-bronze-500/40',
  };

  const iconStyles = {
    1: <Crown className="w-6 h-6 text-gold-500" />,
    2: <Medal className="w-6 h-6 text-slate-300" />,
    3: <Medal className="w-6 h-6 text-bronze-500" />,
  };

  return (
    <Card className={`${bgStyles[rank as keyof typeof bgStyles]} flex items-center gap-4`}>
      <div className="relative">
        <Avatar src={entry.avatar_url} size="md" />
        <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1">
          {iconStyles[rank as keyof typeof iconStyles]}
        </div>
      </div>

      <div className="flex-1">
        <p className={`font-bold text-lg ${isCurrentUser ? 'text-primary-400' : 'text-white'}`}>
          {entry.username}
          {isCurrentUser && <span className="text-xs ml-2">(Vous)</span>}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge rank={entry.season_rank} />
          {entry.current_streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-accent-400">
              <Flame className="w-3 h-3" />
              {entry.current_streak}
            </div>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-white">{entry.season_points}</p>
        <p className="text-xs text-slate-400">
          {entry.wins}W - {entry.losses}L
        </p>
      </div>
    </Card>
  );
}
