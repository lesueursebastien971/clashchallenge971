import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl p-4 shadow-xl mb-6">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <path
                d="M50 10 L90 50 L50 90 L10 50 Z"
                fill="white"
                className="drop-shadow-lg"
              />
              <path
                d="M50 25 L75 50 L50 75 L25 50 Z"
                fill="url(#authGradient)"
              />
              <defs>
                <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Clash<span className="text-gradient"> Challenge</span>
          </h1>
          <p className="mt-3 text-slate-400">
            Dufiez vos amis. Gagnez des rewards. Dominez.
          </p>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
