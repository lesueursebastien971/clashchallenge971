import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../components/ui';
import { supabase } from '../lib/supabase';
import {
  User,
  Shield,
  Bell,
  Moon,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  Save,
  AlertCircle,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { profile, signOut, refreshProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [clashTag, setClashTag] = useState(profile?.clash_royale_tag || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    setSuccess('');

    if (username.length < 3 || username.length > 20) {
      setError('Le pseudo doit contenir entre 3 et 20 caractères');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        username,
        clash_royale_tag: clashTag || null,
      })
      .eq('id', profile.id);

    if (updateError) {
      setError('Erreur lors de la sauvegarde');
    } else {
      setSuccess('Profil mis à jour');
      await refreshProfile();
      setEditMode(false);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      await supabase.from('users').delete().eq('id', profile.id);
      await signOut();
    }
  };

  return (
    <div className="pb-24">
      <div className="px-4 py-6 space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>Retour</span>
        </button>

        <h1 className="text-2xl font-bold text-white">Paramètres</h1>

        <Card className="bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-white">Profil</span>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              {editMode ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {editMode ? (
            <div className="space-y-4 mt-4 pt-4 border-t border-slate-700">
              <Input
                label="Pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
              />
              <Input
                label="Tag Clash Royale (optionnel)"
                value={clashTag}
                onChange={(e) => setClashTag(e.target.value)}
                placeholder="#ABCD1234"
                helperText="Votre tag pour les futurs classements"
              />

              {error && (
                <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-error-400" />
                  <p className="text-error-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-3">
                  <p className="text-success-400 text-sm">{success}</p>
                </div>
              )}

              <Button
                onClick={handleSave}
                loading={loading}
                className="w-full"
                icon={<Save className="w-4 h-4" />}
              >
                Sauvegarder
              </Button>
            </div>
          ) : (
            <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pseudo</span>
                <span className="text-white">{profile?.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tag Clash Royale</span>
                <span className="text-white">{profile?.clash_royale_tag || 'Non défini'}</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-white">Confidentialité</span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <span className="text-sm text-slate-400">Profil public</span>
            <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-white">Notifications</span>
          </div>
          <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Push notifications</span>
              <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Alertes de défi</span>
              <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-white">Apparence</span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <span className="text-sm text-slate-400">Thème sombre</span>
            <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </Card>

        <button className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-white">Aide & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full"
            icon={<LogOut className="w-5 h-5" />}
          >
            Déconnexion
          </Button>

          <Button
            onClick={handleDeleteAccount}
            variant="danger"
            className="w-full border border-error-500/30"
            icon={<Trash2 className="w-5 h-5" />}
          >
            Supprimer mon compte
          </Button>
        </div>

        <p className="text-center text-xs text-slate-600 pt-4">
          Clash Challenge v1.0.0
        </p>
      </div>
    </div>
  );
}
