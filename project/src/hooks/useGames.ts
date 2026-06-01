import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Game, UserGame, Challenge, Wallet, Notification, Ranking, Profile } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }

  return { games, loading, error, refetch: fetchGames };
}

export function useUserGames() {
  const { user } = useAuth();
  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserGames();
    } else {
      setUserGames([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchUserGames() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_games')
        .select('*, game:games(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserGames(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user games');
    } finally {
      setLoading(false);
    }
  }

  async function addUserGame(gameId: string, platform: string, gamerId?: string) {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase.from('user_games').insert({
        user_id: user.id,
        game_id: gameId,
        platform,
        gamer_id: gamerId || '',
      });

      if (error) throw error;
      await fetchUserGames();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to add game' };
    }
  }

  return { userGames, loading, error, addUserGame, refetch: fetchUserGames };
}

export function useChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    } else {
      setChallenges([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchChallenges() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, game:games(*), challenger:profiles!challenger_id(*), opponent:profiles!opponent_id(*)')
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  }

  async function createChallenge(
    opponentId: string,
    gameId: string,
    platform: string,
    credits: number,
    rules?: Record<string, unknown>
  ) {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase.from('challenges').insert({
        challenger_id: user.id,
        opponent_id: opponentId,
        game_id: gameId,
        platform,
        credits_amount: credits,
        rules: rules || {},
      });

      if (error) throw error;
      await fetchChallenges();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to create challenge' };
    }
  }

  async function updateChallengeStatus(challengeId: string, status: Challenge['status']) {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ status })
        .eq('id', challengeId);

      if (error) throw error;
      await fetchChallenges();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update challenge' };
    }
  }

  return {
    challenges,
    loading,
    error,
    createChallenge,
    updateChallengeStatus,
    refetch: fetchChallenges,
  };
}

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWallet();
    } else {
      setWallet(null);
      setLoading(false);
    }
  }, [user]);

  async function fetchWallet() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setWallet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  }

  return { wallet, loading, error, refetch: fetchWallet };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  async function markAllAsRead() {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

export function useRankings(gameId?: string) {
  const [rankings, setRankings] = useState<(Ranking & { profile: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, [gameId]);

  async function fetchRankings() {
    try {
      let query = supabase
        .from('rankings')
        .select(`
          *,
          profile:profiles!user_id(id, user_id, username, display_name, avatar_url, bio, country, skill_level, is_verified, is_pro)
        `)
        .order('points', { ascending: false })
        .limit(100);

      if (gameId) {
        query = query.eq('game_id', gameId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRankings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rankings');
    } finally {
      setLoading(false);
    }
  }

  return { rankings, loading, error, refetch: fetchRankings };
}

export function useSearchPlayers(query: string, gameId?: string) {
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (query.length < 2) {
      setPlayers([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchPlayers();
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, gameId]);

  async function searchPlayers() {
    if (!user || query.length < 2) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .ilike('username', `%${query}%`)
        .limit(20);

      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      console.error('Failed to search players:', err);
    } finally {
      setLoading(false);
    }
  }

  return { players, loading };
}
