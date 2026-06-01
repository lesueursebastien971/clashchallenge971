import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { LangSwitcher } from '../components/LangSwitcher';
import { supabase } from '../lib/supabase';
import {
  Gamepad2, Mail, Lock, Eye, EyeOff, Loader2, User,
  Check, X, AlertCircle, Shield, Zap, Trophy, Users
} from 'lucide-react';

function PasswordStrength({ password, t }: { password: string; t: ReturnType<typeof useI18n>['t'] }) {
  const checks = [
    { label: t.auth.pwCheck6, pass: password.length >= 6 },
    { label: t.auth.pwCheckUpper, pass: /[A-Z]/.test(password) },
    { label: t.auth.pwCheckNumber, pass: /[0-9]/.test(password) },
    { label: t.auth.pwCheckSpecial, pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.pass).length;

  const strengthConfig = [
    { label: '', color: 'bg-gaming-dark-500', textColor: '' },
    { label: t.auth.pwStrengthWeak, color: 'bg-gaming-neon-red', textColor: 'text-gaming-neon-red' },
    { label: t.auth.pwStrengthFair, color: 'bg-gaming-neon-yellow', textColor: 'text-gaming-neon-yellow' },
    { label: t.auth.pwStrengthGood, color: 'bg-blue-400', textColor: 'text-blue-400' },
    { label: t.auth.pwStrengthStrong, color: 'bg-gaming-neon-green', textColor: 'text-gaming-neon-green' },
  ];

  const cfg = strengthConfig[score];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? cfg.color : 'bg-gaming-dark-500'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass
              ? <Check className="w-3 h-3 text-gaming-neon-green" />
              : <X className="w-3 h-3 text-gray-600" />}
            <span className={`text-xs ${c.pass ? 'text-gray-300' : 'text-gray-600'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { signUp } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const perks = [
    { icon: Trophy, label: t.auth.perkPrizes, color: 'text-gaming-neon-yellow' },
    { icon: Users, label: t.auth.perkPlayers, color: 'text-gaming-neon-blue' },
    { icon: Zap, label: t.auth.perkCredits, color: 'text-gaming-neon-green' },
    { icon: Shield, label: t.auth.perkSecure, color: 'text-blue-400' },
  ];

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);
    return () => {
      if (usernameTimer.current) clearTimeout(usernameTimer.current);
    };
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError(t.auth.errUsername3);
      return;
    }
    if (usernameStatus === 'taken') {
      setError(t.auth.errUsernameTaken);
      return;
    }
    if (password.length < 6) {
      setError(t.auth.errPassword6);
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, username);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/onboarding');
    }
  }

  const usernameIcon = () => {
    if (username.length < 3) return <User className="w-5 h-5 text-gray-500" />;
    if (usernameStatus === 'checking') return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    if (usernameStatus === 'available') return <Check className="w-5 h-5 text-gaming-neon-green" />;
    if (usernameStatus === 'taken') return <X className="w-5 h-5 text-gaming-neon-red" />;
    return <User className="w-5 h-5 text-gray-500" />;
  };

  const usernameRingColor = () => {
    if (focusedField !== 'username') return '';
    if (usernameStatus === 'available') return 'ring-1 ring-gaming-neon-green';
    if (usernameStatus === 'taken') return 'ring-1 ring-gaming-neon-red';
    return 'ring-1 ring-gaming-electric-500';
  };

  return (
    <div className="min-h-screen flex bg-gaming-dark-900">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gaming-dark-900 via-gaming-dark-800 to-gaming-dark-900" />
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 animate-pulse"
            style={{ background: 'radial-gradient(circle, #00ff88, transparent)', animationDelay: '1s' }} />
        </div>
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gaming-neon-blue to-gaming-neon-green rounded-xl flex items-center justify-center shadow-lg shadow-gaming-neon-blue/30">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-gaming text-xl font-bold text-white tracking-wider">{t.common.appName}</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">
              {t.auth.joinArenaTitle.split(' ')[0]}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gaming-neon-blue to-gaming-neon-green">
                {t.auth.joinArenaTitle.split(' ').slice(1).join(' ')}
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">{t.auth.joinArenaDesc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {perks.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3 bg-gaming-dark-700/60 border border-gaming-dark-600/50 rounded-xl p-4 backdrop-blur-sm">
                <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                <span className="text-sm text-gray-300 font-medium">{label}</span>
              </div>
            ))}
          </div>

          <div className="bg-gaming-dark-700/40 border border-gaming-dark-600/50 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-gray-300 text-sm italic mb-3">{t.auth.testimonial}</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gaming-neon-blue to-gaming-neon-green flex items-center justify-center text-xs font-bold text-white">
                KX
              </div>
              <div>
                <p className="text-white text-sm font-semibold">kingxero</p>
                <p className="text-gray-500 text-xs">{t.auth.testimonialRole}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-sm">{t.common.copyright}</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 animate-pulse"
            style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
        </div>

        <div className="relative w-full max-w-md">
          {/* Lang switcher */}
          <div className="flex justify-end mb-4">
            <LangSwitcher />
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gaming-neon-blue to-gaming-neon-green rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-gaming text-xl font-bold text-white">{t.common.appName}</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t.auth.createAccount}</h1>
            <p className="text-gray-400">
              {t.auth.alreadyAccount}{' '}
              <Link to="/login" className="text-gaming-neon-blue hover:text-white transition-colors font-semibold">
                {t.common.signIn}
              </Link>
            </p>
          </div>

          <div className="mb-6 flex items-center gap-3 bg-gaming-neon-green/10 border border-gaming-neon-green/25 rounded-xl px-4 py-3">
            <Zap className="w-5 h-5 text-gaming-neon-green flex-shrink-0" />
            <p className="text-gaming-neon-green text-sm font-medium">{t.auth.bonusBanner}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                {t.auth.usernameLabel}
              </label>
              <div className={`relative rounded-xl transition-all duration-200 ${usernameRingColor()}`}>
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="input pl-12 pr-12 w-full"
                  placeholder={t.auth.usernamePlaceholder}
                  required
                  minLength={3}
                  maxLength={20}
                  autoComplete="username"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameIcon()}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-gray-500">{t.auth.usernameHint}</p>
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-gaming-neon-red font-medium">{t.auth.usernameTaken}</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs text-gaming-neon-green font-medium">{t.auth.usernameAvailable}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t.auth.emailLabel}
              </label>
              <div className={`relative rounded-xl transition-all duration-200 ${focusedField === 'email' ? 'ring-1 ring-gaming-electric-500' : ''}`}>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="input pl-12 w-full"
                  placeholder={t.auth.emailPlaceholder}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t.auth.passwordLabel}
              </label>
              <div className={`relative rounded-xl transition-all duration-200 ${focusedField === 'password' ? 'ring-1 ring-gaming-electric-500' : ''}`}>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="input pl-12 pr-12 w-full"
                  placeholder={t.auth.passwordPlaceholder.replace('Enter your password', t.auth.pwStrengthStrong)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {(focusedField === 'password' || password) && (
                <PasswordStrength password={password} t={t} />
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gaming-neon-red/10 border border-gaming-neon-red/30 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-gaming-neon-red flex-shrink-0 mt-0.5" />
                <p className="text-gaming-neon-red text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking'}
              className="relative w-full py-4 rounded-xl text-white font-gaming font-semibold tracking-wider text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
                boxShadow: '0 0 24px rgba(0, 212, 255, 0.35), 0 0 48px rgba(0, 255, 136, 0.15)',
              }}
            >
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200 rounded-xl" />
              <span className="relative flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.auth.creatingAccount}</>
                  : t.auth.createAccountBtn}
              </span>
            </button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">{t.auth.terms}</p>
          </form>

          {/* Mobile perks */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
            {perks.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 bg-gaming-dark-700/60 border border-gaming-dark-600/50 rounded-xl p-3">
                <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
