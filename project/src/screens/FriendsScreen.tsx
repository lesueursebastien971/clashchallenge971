import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Avatar, Badge, Input } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { User, Friendship } from '../types/database';
import {
  UserPlus,
  Search,
  Users,
  Clock,
  Check,
  X,
  MessageSquare,
  Swords,
} from 'lucide-react';

interface FriendsScreenProps {
  onChallenge: (friendId: string) => void;
}

type FriendsTab = 'all' | 'pending' | 'add';

export function FriendsScreen({ onChallenge }: FriendsScreenProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<FriendsTab>('all');
  const [friends, setFriends] = useState<(Friendship & { friend: User })[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(Friendship & { friend: User })[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchFriends();
    }
  }, [profile]);

  useEffect(() => {
    if (searchUsername.length >= 3) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchUsername]);

  const fetchFriends = async () => {
    if (!profile) return;

    const [friendsRes, pendingRes] = await Promise.all([
      supabase
        .from('friends')
        .select(`
          *,
          friend:users!friends_friend_id_fkey (*)
        `)
        .eq('user_id', profile.id)
        .eq('status', 'accepted'),
      supabase
        .from('friends')
        .select(`
          *,
          friend:users!friends_friend_id_fkey (*)
        `)
        .eq('friend_id', profile.id)
        .eq('status', 'pending'),
    ]);

    if (friendsRes.data) setFriends(friendsRes.data as any);
    if (pendingRes.data) setPendingRequests(pendingRes.data as any);

    setLoading(false);
  };

  const searchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .ilike('username', `%${searchUsername}%`)
      .neq('id', profile?.id)
      .limit(10);

    if (data) {
      setSearchResults(data);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!profile) return;

    await supabase.from('friends').insert({
      user_id: profile.id,
      friend_id: friendId,
      status: 'pending',
    });

    setSearchUsername('');
    setSearchResults([]);
  };

  const acceptFriendRequest = async (requestId: string) => {
    await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    fetchFriends();
  };

  const rejectFriendRequest = async (requestId: string) => {
    await supabase.from('friends').delete().eq('id', requestId);

    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  return (
    <div className="pb-24">
      <div className="px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Amis</h1>

        <div className="flex gap-2 bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Tous</span>
            <span className="bg-slate-600 text-xs px-2 py-0.5 rounded-full">
              {friends.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">En attente</span>
            {pendingRequests.length > 0 && (
              <span className="bg-accent-500 text-xs px-2 py-0.5 rounded-full text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activeTab === 'add'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Ajouter</span>
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="space-y-3">
            {loading ? (
              <Card className="text-center py-8">
                <p className="text-slate-500">Chargement...</p>
              </Card>
            ) : friends.length === 0 ? (
              <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">Aucun ami pour le moment</p>
                <Button
                  onClick={() => setActiveTab('add')}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                >
                  Ajouter des amis
                </Button>
              </Card>
            ) : (
              friends.map((friendship) => (
                <Card key={friendship.id} className="flex items-center gap-4">
                  <Avatar src={friendship.friend.avatar_url} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-white">{friendship.friend.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge rank={friendship.friend.season_rank} />
                      <span className="text-xs text-slate-400">
                        {friendship.friend.wins}W - {friendship.friend.losses}L
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onChallenge(friendship.friend.id)}
                    size="sm"
                    className="px-4"
                    icon={<Swords className="w-4 h-4" />}
                  >
                    Défier
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">Aucune demande en attente</p>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} className="flex items-center gap-4">
                  <Avatar src={request.friend.avatar_url} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-white">{request.friend.username}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Veut être votre ami
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptFriendRequest(request.id)}
                      className="p-2 bg-success-500 rounded-lg hover:bg-success-600 transition-colors"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request.id)}
                      className="p-2 bg-error-500 rounded-lg hover:bg-error-600 transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                placeholder="Rechercher par pseudo..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="pl-12"
              />
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => {
                  const isFriend = friends.some(f => f.friend_id === user.id);
                  const isPending = pendingRequests.some(p => p.user_id === user.id);

                  return (
                    <Card key={user.id} className="flex items-center gap-4">
                      <Avatar src={user.avatar_url} size="sm" />
                      <div className="flex-1">
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-xs text-slate-400">
                          {user.wins}W - {user.losses}L
                        </p>
                      </div>
                      {isFriend ? (
                        <span className="text-sm text-success-400">Ami</span>
                      ) : isPending ? (
                        <span className="text-sm text-warning-400">En attente</span>
                      ) : (
                        <Button
                          onClick={() => sendFriendRequest(user.id)}
                          size="sm"
                          variant="secondary"
                          className="px-4"
                        >
                          Ajouter
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : searchUsername.length >= 3 ? (
              <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
                <p className="text-slate-500">Aucun utilisateur trouvé</p>
              </Card>
            ) : (
              <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">Entrez un pseudo pour rechercher</p>
                <p className="text-xs text-slate-600 mt-1">Minimum 3 caractères</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
