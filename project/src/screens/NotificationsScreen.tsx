import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Avatar, Badge, Button } from '../components/ui';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types/database';
import {
  Bell,
  Swords,
  UserPlus,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';

export function NotificationsScreen() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const subscribeToNotifications = () => {
    if (!profile) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!profile) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profile.id)
      .eq('read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      challenge_received: Swords,
      challenge_accepted: CheckCircle,
      challenge_declined: XCircle,
      match_win: Trophy,
      match_loss: AlertCircle,
      friend_request: UserPlus,
      friend_accepted: UserPlus,
      season_rank_up: TrendingUp,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      challenge_received: 'bg-warning-500/20 text-warning-400',
      challenge_accepted: 'bg-success-500/20 text-success-400',
      challenge_declined: 'bg-error-500/20 text-error-400',
      match_win: 'bg-gold-500/20 text-gold-500',
      match_loss: 'bg-error-500/20 text-error-400',
      friend_request: 'bg-primary-500/20 text-primary-400',
      friend_accepted: 'bg-success-500/20 text-success-400',
      season_rank_up: 'bg-accent-500/20 text-accent-400',
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;

    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="pb-24">
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              icon={<Check className="w-4 h-4" />}
            >
              Tout marquer lu
            </Button>
          )}
        </div>

        {loading ? (
          <Card className="text-center py-8">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">Aucune notification</p>
            <p className="text-sm text-slate-600 mt-1">
              Vos défis et résultats apparaîtront ici
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);

              return (
                <Card
                  key={notification.id}
                  interactive
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`${
                    !notification.read ? 'bg-slate-800 border-l-4 border-l-primary-500' : 'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
