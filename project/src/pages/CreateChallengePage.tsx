import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGames, useSearchPlayers, useChallenges, useWallet } from '../hooks/useGames';
import {
  Search,
  Gamepad2,
  Monitor,
  CreditCard,
  ChevronRight,
  Loader2,
  AlertCircle,
  User,
  Check,
} from 'lucide-react';
import type { Profile, Game } from '../types/database';

export function CreateChallengePage() {
  const { profile } = useAuth();
  const { games } = useGames();
  const { wallet } = useWallet();
  const { createChallenge } = useChallenges();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Profile | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [credits, setCredits] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { players } = useSearchPlayers(searchQuery, selectedGame?.id);

  useEffect(() => {
    if (selectedGame) {
      setSelectedPlatform('');
    }
  }, [selectedGame]);

  const maxCredits = wallet?.balance || 100;

  async function handleCreateChallenge() {
    if (!selectedPlayer || !selectedGame || !selectedPlatform) {
      setError('Please complete all fields');
      return;
    }

    if (credits > maxCredits) {
      setError('Insufficient credits');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: createError } = await createChallenge(
      selectedPlayer.user_id,
      selectedGame.id,
      selectedPlatform,
      credits
    );

    if (createError) {
      setError(createError);
      setLoading(false);
    } else {
      navigate('/challenges');
    }
  }

  const creditOptions = [10, 25, 50, 100];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Create Challenge</h1>
        <p className="text-gray-400">Challenge another player to prove your skills</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all ${
              s <= step ? 'bg-gaming-electric-500' : 'bg-gaming-dark-600'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Select Player */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-white">Select Opponent</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
              placeholder="Search players by username..."
            />
          </div>

          {searchQuery.length >= 2 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {players.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No players found</p>
              ) : (
                players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayer(player);
                      setStep(2);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gaming-dark-700 hover:bg-gaming-dark-600 transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gaming-dark-600 overflow-hidden">
                      {player.avatar_url ? (
                        <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{player.display_name || player.username}</p>
                      <p className="text-sm text-gray-400">@{player.username}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                ))
              )}
            </div>
          )}

          {selectedPlayer && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gaming-electric-500/10 border border-gaming-electric-500/30">
              <Check className="w-5 h-5 text-gaming-neon-green" />
              <span className="text-white">Selected: {selectedPlayer.display_name || selectedPlayer.username}</span>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Game */}
      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-white">Select Game</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => {
                  setSelectedGame(game);
                  setStep(3);
                }}
                className={`card p-4 text-center hover:border-gaming-electric-500 transition-all ${
                  selectedGame?.id === game.id ? 'border-gaming-electric-500 bg-gaming-electric-500/10' : ''
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-gaming-dark-600 flex items-center justify-center mb-2">
                  <Gamepad2 className="w-6 h-6 text-gaming-electric-500" />
                </div>
                <span className="text-sm font-semibold text-white">{game.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Platform */}
      {step === 3 && (
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-white">Select Platform</h2>
          <div className="space-y-2">
            {['PS5', 'Xbox', 'PC', 'Nintendo Switch'].map((platform) => (
              <button
                key={platform}
                onClick={() => {
                  setSelectedPlatform(platform);
                  setStep(4);
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                  selectedPlatform === platform
                    ? 'bg-gaming-electric-500/10 border border-gaming-electric-500'
                    : 'bg-gaming-dark-700 hover:bg-gaming-dark-600'
                }`}
              >
                <Monitor className="w-6 h-6 text-gaming-electric-500" />
                <span className="font-semibold text-white">{platform}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Credits & Confirmation */}
      {step === 4 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-white">Set Wager</h2>

          {/* Credit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Credit Amount (Max: {maxCredits})
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {creditOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCredits(amount)}
                  disabled={amount > maxCredits}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    credits === amount
                      ? 'bg-gaming-electric-500 text-white'
                      : amount > maxCredits
                        ? 'bg-gaming-dark-700 text-gray-600 cursor-not-allowed'
                        : 'bg-gaming-dark-700 text-gray-300 hover:bg-gaming-dark-600'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(Math.max(1, Math.min(maxCredits, parseInt(e.target.value) || 0)))}
              className="input w-32"
              min={1}
              max={maxCredits}
            />
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 rounded-xl bg-gaming-dark-700">
            <div className="flex justify-between">
              <span className="text-gray-400">Opponent</span>
              <span className="font-semibold text-white">{selectedPlayer?.display_name || selectedPlayer?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Game</span>
              <span className="font-semibold text-white">{selectedGame?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform</span>
              <span className="font-semibold text-white">{selectedPlatform}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gaming-dark-600">
              <span className="text-gray-400">Credits Wagered</span>
              <span className="font-bold text-gaming-neon-yellow">{credits}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gaming-neon-red/10 text-gaming-neon-red">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleCreateChallenge}
            disabled={loading}
            className="btn btn-neon w-full py-4 text-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Challenge'}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn btn-secondary">
            Back
          </button>
        )}
      </div>
    </div>
  );
}
