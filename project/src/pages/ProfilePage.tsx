import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useRankings } from '../hooks/useGames';
import {
  User,
  Trophy,
  Swords,
  Medal,
  Flame,
  Star,
  Edit,
  Settings,
  LogOut,
  Gamepad2,
  MapPin,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import type { Profile, UserGame, Ranking } from '../types/database';

interface FullProfile extends Profile {
  user_games?: (UserGame & { game: { name: string } })[];
  rankings?: Ranking[];
}

export function ProfilePage() {
  const { userId } = useParams();
  const { profile: currentUser, signOut, updateProfile } = useAuth();
  const { rankings } = useRankings();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '' });

  const isOwnProfile = userId === currentUser?.user_id || (!userId && currentUser);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    const targetId = userId || currentUser?.user_id;

    if (!targetId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*, user_games(*, game:games(name)), rankings(*)')
      .eq('user_id', targetId)
      .maybeSingle();

    setProfile(data as FullProfile);
    if (data && isOwnProfile) {
      setEditForm({
        display_name: data.display_name || data.username,
        bio: data.bio || '',
      });
    }
    setLoading(false);
  }

  async function handleSaveEdit() {
    if (!isOwnProfile) return;

    const { error } = await updateProfile(editForm);

    if (!error) {
      setIsEditing(false);
      await loadProfile();
    }
  }

  const totalWins = (profile?.rankings || []).reduce((sum, r) => sum + (r.wins || 0), 0);
  const totalLosses = (profile?.rankings || []).reduce((sum, r) => sum + (r.losses || 0), 0);
  const totalPoints = (profile?.rankings || []).reduce((sum, r) => sum + (r.points || 0), 0);
  const bestStreak = Math.max(...(profile?.rankings?.map((r) => r.max_streak) || [0]));
  const currentStreak = Math.max(...(profile?.rankings?.map((r) => r.win_streak) || [0]));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-gaming-electric-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card text-center py-12">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Profile not found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cover & Avatar */}
      <div className="relative">
        <div className="h-32 md:h-48 rounded-2xl bg-gradient-to-br from-gaming-electric-500/30 via-gaming-dark-800 to-gaming-neon-blue/30 overflow-hidden">
          {profile.cover_url && (
            <img src={profile.cover_url} alt="" className="w-full h-full object-cover opacity-50" />
          )}
        </div>

        <div className="absolute -bottom-16 left-6 flex items-end gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gaming-dark-700 border-4 border-gaming-dark-900 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gaming-dark-600">
                <User className="w-16 h-16 text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 btn btn-secondary p-2"
          >
            <Edit className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="pt-20 px-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <input
                type="text"
                value={editForm.display_name}
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                className="input"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="input min-h-[100px]"
                maxLength={200}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveEdit} className="btn btn-primary">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {profile.display_name || profile.username}
              </h1>
              {profile.is_pro && <span className="badge-primary">PRO</span>}
              {profile.is_verified && (
                <div className="w-6 h-6 rounded-full bg-gaming-neon-blue flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </div>
            <p className="text-gray-400 mb-4">@{profile.username}</p>

            {profile.bio && (
              <p className="text-gray-300 mb-4 max-w-xl">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {profile.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.country}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {!isOwnProfile && (
          <div className="mt-6 flex gap-3">
            <button className="btn btn-neon">
              <Swords className="w-5 h-5" />
              Challenge
            </button>
            <button className="btn btn-secondary">
              <User className="w-5 h-5" />
              Add Friend
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
        <div className="stat-card">
          <Trophy className="w-6 h-6 text-gaming-neon-yellow mb-2" />
          <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total Points</p>
        </div>
        <div className="stat-card">
          <Medal className="w-6 h-6 text-gaming-neon-green mb-2" />
          <p className="text-2xl font-bold text-white">{totalWins}</p>
          <p className="text-sm text-gray-400">Wins</p>
        </div>
        <div className="stat-card">
          <Medal className="w-6 h-6 text-gaming-neon-red mb-2" />
          <p className="text-2xl font-bold text-white">{totalLosses}</p>
          <p className="text-sm text-gray-400">Losses</p>
        </div>
        <div className="stat-card">
          <Flame className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-white">{currentStreak}</p>
          <p className="text-sm text-gray-400">Win Streak</p>
        </div>
      </div>

      {/* Games */}
      {profile.user_games && profile.user_games.length > 0 && (
        <div className="px-6">
          <h2 className="text-xl font-bold text-white mb-4">Games</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {profile.user_games.map((ug) => (
              <div key={ug.id} className="card">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gaming-dark-600 flex items-center justify-center">
                    <Gamepad2 className="w-7 h-7 text-gaming-electric-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{ug.game?.name}</p>
                    <p className="text-sm text-gray-400">{ug.platform}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      ug.rank_tier === 'master' || ug.rank_tier === 'grandmaster'
                        ? 'badge-success'
                        : 'badge-primary'
                    }`}>
                      {ug.rank_tier}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{ug.games_played} games</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions (Own Profile) */}
      {isOwnProfile && (
        <div className="px-6 space-y-2">
          <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-gaming-dark-800 border border-gaming-dark-600 hover:border-gaming-electric-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-400" />
              <span className="font-medium text-white">Account Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-gaming-dark-800 border border-gaming-dark-600 hover:border-gaming-neon-red/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-6 h-6 text-gaming-neon-red" />
              <span className="font-medium text-white">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}
