import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full scale-150 animate-pulse-slow" />
          <div className="relative bg-gradient-to-br from-primary-600 to-primary-400 rounded-3xl p-8 shadow-2xl">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  d="M50 10 L90 50 L50 90 L10 50 Z"
                  fill="white"
                  className="drop-shadow-lg"
                />
                <path
                  d="M50 25 L75 50 L50 75 L25 50 Z"
                  fill="url(#gradient)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Clash
            <span className="text-gradient"> Challenge</span>
          </h1>
          <p className="mt-3 text-slate-400 text-lg">
            Dufiez vos amis. Gagnez desRewards. Dominez le classement.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-slate-500 text-sm">Chargement...</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
