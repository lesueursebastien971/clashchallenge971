import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useGames } from '../hooks/useGames';
import { ChevronRight, Gamepad2, Monitor, Tv, ChevronLeft, Check, Loader2, Target, MapPin } from 'lucide-react';
import type { Game, SkillLevel } from '../types/database';

const platforms = [
  { id: 'PS5', label: 'PlayStation 5', icon: Tv },
  { id: 'Xbox', label: 'Xbox Series X|S', icon: Monitor },
  { id: 'PC', label: 'PC', icon: Monitor },
  { id: 'Nintendo Switch', label: 'Nintendo Switch', icon: Tv },
];

const countries = [
  'United States', 'Canada', 'United Kingdom', 'France', 'Germany', 'Spain', 'Italy',
  'Japan', 'South Korea', 'China', 'Brazil', 'Mexico', 'Australia', 'Other',
];

export function OnboardingPage() {
  const { user, profile, updateProfile } = useAuth();
  const { games, addUserGame } = useGames();
  const { t, fmt } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [gametertags, setGamertags] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.username);
      setBio(profile.bio || '');
      setCountry(profile.country || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const skillLevels: { value: SkillLevel; label: string; description: string; badge: string }[] = [
    { value: 'beginner', label: t.onboarding.skillBeginner, description: t.onboarding.skillBeginnerDesc, badge: '🌱' },
    { value: 'casual', label: t.onboarding.skillCasual, description: t.onboarding.skillCasualDesc, badge: '🎮' },
    { value: 'intermediate', label: t.onboarding.skillIntermediate, description: t.onboarding.skillIntermediateDesc, badge: '⭐' },
    { value: 'advanced', label: t.onboarding.skillAdvanced, description: t.onboarding.skillAdvancedDesc, badge: '🔥' },
    { value: 'expert', label: t.onboarding.skillExpert, description: t.onboarding.skillExpertDesc, badge: '👑' },
    { value: 'pro', label: t.onboarding.skillPro, description: t.onboarding.skillProDesc, badge: '💎' },
  ];

  async function handleNext() {
    if (step === 1) {
      if (!displayName.trim() || !country) return;
      await updateProfile({ display_name: displayName.trim(), country, bio: bio.trim() });
    } else if (step === 2) {
      if (selectedGames.length === 0) return;
    } else if (step === 3) {
      if (selectedPlatforms.length === 0) return;
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  async function handleComplete() {
    setLoading(true);
    try {
      await updateProfile({ skill_level: skillLevel, is_online: true });
      for (const game of selectedGames) {
        const gamertag = gametertags[game.id] || '';
        for (const platform of selectedPlatforms) {
          await addUserGame(game.id, platform, gamertag);
        }
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gaming-dark-900 flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gaming-electric-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gaming-neon-blue/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-12">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              {fmt(t.onboarding.stepOf, { step, total: totalSteps })}
            </span>
            <span className="text-sm text-gaming-electric-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gaming-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gaming-electric-500 to-gaming-neon-blue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1">
          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-white mb-2">{t.onboarding.step1Title}</h1>
              <p className="text-gray-400 mb-8">{t.onboarding.step1Subtitle}</p>
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Gamepad2 className="w-4 h-4 text-gaming-electric-500" />
                    {t.onboarding.displayNameLabel}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input text-lg py-4"
                    placeholder={t.onboarding.displayNamePlaceholder}
                    maxLength={30}
                  />
                  <p className="text-xs text-gray-500 mt-2">{t.onboarding.displayNameHint}</p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 text-gaming-neon-blue" />
                    {t.onboarding.countryLabel}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input text-lg py-4"
                  >
                    <option value="">{t.onboarding.countryPlaceholder}</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Target className="w-4 h-4 text-gaming-neon-green" />
                    {t.onboarding.bioLabel}
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input text-lg py-4 resize-none h-24"
                    placeholder={t.onboarding.bioPlaceholder}
                    maxLength={150}
                  />
                  <p className="text-xs text-gray-500 mt-2">{fmt(t.onboarding.bioChars, { count: bio.length })}</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-white mb-2">{t.onboarding.step2Title}</h1>
              <p className="text-gray-400 mb-8">{t.onboarding.step2Subtitle}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGames((prev) =>
                      prev.find((g) => g.id === game.id)
                        ? prev.filter((g) => g.id !== game.id)
                        : [...prev, game]
                    )}
                    className={`card p-4 text-left transition-all hover:scale-105 ${
                      selectedGames.find((g) => g.id === game.id)
                        ? 'border-gaming-electric-500 bg-gaming-electric-500/10'
                        : 'border-gaming-dark-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Gamepad2 className="w-6 h-6 text-gaming-electric-500" />
                      {selectedGames.find((g) => g.id === game.id) && (
                        <Check className="w-5 h-5 text-gaming-neon-green" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white">{game.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-white mb-2">{t.onboarding.step3Title}</h1>
              <p className="text-gray-400 mb-8">{t.onboarding.step3Subtitle}</p>
              <div className="space-y-3">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatforms((prev) =>
                        isSelected ? prev.filter((p) => p !== platform.id) : [...prev, platform.id]
                      )}
                      className={`w-full card p-4 flex items-center gap-4 transition-all hover:scale-[1.02] ${
                        isSelected ? 'border-gaming-electric-500 bg-gaming-electric-500/10' : 'border-gaming-dark-500'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-gaming-electric-500' : 'bg-gaming-dark-600'}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-white">{platform.label}</span>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-gaming-neon-green" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-white mb-2">{t.onboarding.step4Title}</h1>
              <p className="text-gray-400 mb-8">{t.onboarding.step4Subtitle}</p>
              <div className="space-y-4">
                {selectedGames.map((game) => (
                  <div key={game.id}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {fmt(t.onboarding.gamertagLabel, { game: game.name })}
                    </label>
                    <input
                      type="text"
                      value={gametertags[game.id] || ''}
                      onChange={(e) => setGamertags((prev) => ({ ...prev, [game.id]: e.target.value }))}
                      className="input text-lg py-3"
                      placeholder={fmt(t.onboarding.gamertagPlaceholder, { game: game.name })}
                      maxLength={50}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-white mb-2">{t.onboarding.step5Title}</h1>
              <p className="text-gray-400 mb-8">{t.onboarding.step5Subtitle}</p>
              <div className="space-y-3">
                {skillLevels.map((level) => {
                  const isSelected = skillLevel === level.value;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setSkillLevel(level.value)}
                      className={`w-full card p-4 text-left transition-all hover:scale-[1.02] ${
                        isSelected ? 'border-gaming-electric-500 bg-gaming-electric-500/10' : 'border-gaming-dark-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{level.badge}</span>
                          <div>
                            <span className="font-semibold text-white">{level.label}</span>
                            <p className="text-sm text-gray-400 mt-0.5">{level.description}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-gaming-neon-green" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn btn-secondary px-6">
              <ChevronLeft className="w-5 h-5" />
              {t.common.back}
            </button>
          )}
          <div className="flex-1" />
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={
                step === 1 ? !displayName.trim() || !country :
                step === 2 ? selectedGames.length === 0 :
                step === 3 ? selectedPlatforms.length === 0 :
                false
              }
              className="btn btn-neon px-8"
            >
              {t.common.next}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading} className="btn btn-neon px-8">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.onboarding.startGaming}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
