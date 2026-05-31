import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3 || username.length > 20) {
      setError('Le pseudo doit contenir entre 3 et 20 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, username);

    if (result.error) {
      setError(result.error.message || 'Erreur lors de la creation du compte');
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Inscription</h2>
        <p className="mt-2 text-slate-400">Rejoignez l'arene</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Pseudo (3-20 caracteres)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-12"
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="password"
              placeholder="Mot de passe (min. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12"
              required
              minLength={6}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-12"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3">
            <p className="text-error-400 text-sm text-center">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Creer mon compte
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Deja un compte ? Se connecter
          </button>
        </div>
      </form>
    </Card>
  );
}
