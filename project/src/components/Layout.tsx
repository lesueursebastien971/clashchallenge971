import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet, useNotifications } from '../hooks/useGames';
import { useI18n } from '../i18n/I18nContext';
import { LangSwitcher } from './LangSwitcher';
import {
  Home,
  Swords,
  Search,
  Trophy,
  Wallet,
  Bell,
  User,
  LogOut,
  Gamepad2,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function DashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const { wallet } = useWallet();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const navItems = [
    { to: '/dashboard', icon: Home, label: t.nav.home },
    { to: '/challenges', icon: Swords, label: t.nav.challenges },
    { to: '/matchmaking', icon: Search, label: t.nav.findPlayers },
    { to: '/leaderboard', icon: Trophy, label: t.nav.leaderboard },
    { to: '/wallet', icon: Wallet, label: t.nav.wallet },
  ];

  return (
    <div className="min-h-screen bg-gaming-dark-900 pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col lg:w-72">
        <div className="flex flex-col flex-1 bg-gaming-dark-800 border-r border-gaming-dark-600">
          {/* Logo */}
          <div className="p-6 border-b border-gaming-dark-600">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-gaming text-xl font-bold text-white">{t.common.appName}</span>
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gaming-electric-500 text-white shadow-lg shadow-gaming-electric-500/20'
                      : 'text-gray-400 hover:bg-gaming-dark-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gaming-dark-600 space-y-1">
            {/* Lang switcher */}
            <div className="px-4 py-2">
              <LangSwitcher />
            </div>
            <NavLink
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gaming-dark-700 hover:text-white transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gaming-dark-600 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{profile?.display_name || profile?.username}</p>
                <p className="text-xs text-gray-500 truncate">@{profile?.username}</p>
              </div>
            </NavLink>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gaming-dark-700 hover:text-gaming-neon-red transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t.common.signOut}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64 lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-gaming-dark-900/95 backdrop-blur-xl border-b border-gaming-dark-600">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gaming-dark-700"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo (mobile) */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-gaming text-lg font-bold text-white">{t.common.appName}</span>
            </div>

            {/* Credits & Notifications */}
            <div className="flex items-center gap-3">
              <LangSwitcher compact />
              {wallet && (
                <NavLink
                  to="/wallet"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gaming-dark-700 border border-gaming-dark-500"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-gaming-dark-900">$</span>
                  </div>
                  <span className="font-semibold text-white">{wallet.balance.toLocaleString()}</span>
                </NavLink>
              )}
              <NavLink
                to="/notifications"
                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gaming-dark-700"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gaming-neon-red rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className="w-10 h-10 rounded-full bg-gaming-dark-600 flex items-center justify-center overflow-hidden"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </NavLink>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="mobile-nav md:hidden safe-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-gaming-electric-500'
                    : 'text-gray-500 hover:text-white'
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                isActive ? 'text-gaming-electric-500' : 'text-gray-500 hover:text-white'
              }`
            }
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">{t.nav.profile}</span>
          </NavLink>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gaming-dark-800 border-r border-gaming-dark-600">
            <div className="p-4 border-b border-gaming-dark-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gaming-electric-500 to-gaming-neon-blue rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-gaming text-lg font-bold text-white">{t.common.appName}</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gaming-dark-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setShowMobileMenu(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gaming-electric-500 text-white'
                        : 'text-gray-400 hover:bg-gaming-dark-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-gaming-dark-600 space-y-2">
              <LangSwitcher />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gaming-dark-700 hover:text-gaming-neon-red transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t.common.signOut}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
