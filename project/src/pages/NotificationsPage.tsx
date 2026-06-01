import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { useNotifications } from '../hooks/useGames';
import { Bell, Swords, User, Trophy, AlertCircle, Zap, CheckCheck } from 'lucide-react';

export function NotificationsPage() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t, fmt } = useI18n();

  const notificationIcons = {
    challenge: { icon: Swords, color: 'text-gaming-electric-500', bg: 'bg-gaming-electric-500/20' },
    friend: { icon: User, color: 'text-gaming-neon-blue', bg: 'bg-gaming-neon-blue/20' },
    result: { icon: Trophy, color: 'text-gaming-neon-yellow', bg: 'bg-gaming-neon-yellow/20' },
    system: { icon: Zap, color: 'text-gaming-neon-purple', bg: 'bg-gaming-neon-purple/20' },
    promotion: { icon: Trophy, color: 'text-gaming-neon-green', bg: 'bg-gaming-neon-green/20' },
    achievement: { icon: AlertCircle, color: 'text-gaming-neon-yellow', bg: 'bg-gaming-neon-yellow/20' },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-gaming-electric-500" />
            {t.notifications.title}
          </h1>
          <p className="text-gray-400">
            {unreadCount > 0
              ? fmt(t.notifications.unread, { count: unreadCount })
              : t.notifications.allCaughtUp}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" />
            {t.notifications.markAllRead}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-gaming-electric-500 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t.notifications.empty}</h2>
          <p className="text-gray-400">{t.notifications.emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = notificationIcons[notification.type] ?? notificationIcons.system;
            const Icon = config.icon;
            return (
              <div
                key={notification.id}
                className={`card cursor-pointer transition-all hover:scale-[1.01] ${
                  notification.is_read ? 'opacity-70' : 'border-gaming-electric-500/30 bg-gaming-electric-500/5'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white">{notification.title}</p>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-gaming-electric-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleDateString()} at{' '}
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
