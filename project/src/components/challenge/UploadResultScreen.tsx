import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Input } from '../ui';
import { supabase } from '../../lib/supabase';
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface UploadResultScreenProps {
  matchId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function UploadResultScreen({
  matchId,
  onBack,
  onComplete,
}: UploadResultScreenProps) {
  const { profile } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image trop volumineuse (max 5MB)');
        return;
      }

      setImageFile(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!profile || !imageFile) return;
    setLoading(true);
    setError('');

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${profile.id}/${matchId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      const { error: screenshotError } = await supabase
        .from('screenshots')
        .insert({
          match_id: matchId,
          user_id: profile.id,
          image_url: imageUrl,
        });

      if (screenshotError) throw screenshotError;

      const { data: matchData } = await supabase
        .from('matches')
        .select('*, challenge:challenges (*)')
        .eq('id', matchId)
        .single();

      if (matchData) {
        const isChallenger = matchData.challenge.challenger_id === profile.id;
        const opponentId = isChallenger
          ? matchData.challenge.opponent_id
          : matchData.challenge.challenger_id;

        await supabase
          .from('matches')
          .update({
            winner_id: profile.id,
            loser_id: opponentId,
          })
          .eq('id', matchId);

        await supabase
          .from('challenges')
          .update({ status: 'completed' })
          .eq('id', matchData.challenge_id);

        const { data: winnerData } = await supabase
          .from('users')
          .select('coins')
          .eq('id', profile.id)
          .single();

        const { data: loserData } = await supabase
          .from('users')
          .select('coins')
          .eq('id', opponentId)
          .single();

        if (winnerData && matchData.challenge) {
          await supabase
            .from('users')
            .update({
              coins: winnerData.coins + matchData.challenge.stake_amount,
              wins: (await supabase.from('users').select('wins').eq('id', profile.id).single()).data?.wins || 0 + 1,
              current_streak: (await supabase.from('users').select('current_streak').eq('id', profile.id).single()).data?.current_streak || 0 + 1,
            })
            .eq('id', profile.id);

          if (loserData && matchData.challenge.stake_amount <= loserData.coins) {
            await supabase
              .from('users')
              .update({
                coins: loserData.coins - matchData.challenge.stake_amount,
                losses: (await supabase.from('users').select('losses').eq('id', opponentId).single()).data?.losses || 0 + 1,
                current_streak: 0,
              })
              .eq('id', opponentId);
          }

          await supabase.from('notifications').insert({
            user_id: opponentId,
            type: 'match_loss',
            title: 'Défaite',
            message: `Vous avez perdu contre ${profile.username}`,
            data: { match_id: matchId },
          });
        }
      }

      onComplete();
    } catch (err) {
      setError('Erreur lors de l\'envoi du résultat');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="pb-24 px-4 py-6 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
        <span>Annuler</span>
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Déclarer ma victoire</h1>
        <p className="text-slate-400 text-sm">
          Uploadez une capture d'écran prouvant votre victoire
        </p>
      </div>

      <Card className="text-center py-8 bg-slate-800/30 border-dashed border-slate-700">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Screenshot preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="screenshot-upload"
            />
            <label
              htmlFor="screenshot-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="bg-slate-700 rounded-xl p-4">
                <ImageIcon className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-400">Cliquez pour ajouter une image</p>
              <p className="text-xs text-slate-500">PNG, JPG (max 5MB)</p>
            </label>
          </>
        )}
      </Card>

      {error && (
        <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-error-400" />
          <p className="text-error-400 text-sm">{error}</p>
        </div>
      )}

      <Input
        label="Notes (optionnel)"
        placeholder="Ajoutez des détails sur le match..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button
        onClick={handleSubmit}
        disabled={!imageFile || loading}
        loading={loading}
        className="w-full"
        size="lg"
        icon={<Upload className="w-5 h-5" />}
      >
        Soumettre le résultat
      </Button>

      <p className="text-xs text-center text-slate-500">
        En soumettant, vous confirmez avoir gagné ce match équitablement
      </p>
    </div>
  );
}
