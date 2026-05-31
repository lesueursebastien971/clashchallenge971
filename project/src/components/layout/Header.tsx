import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Badge } from '../ui';
import { Coins } from 'lucide-react';

export function Header() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={profile.avatar_url} size="md" />
            <div>
              <p className="font-semibold text-white text-sm">{profile.username}</p>
              <div className="flex items-center gap-2">
                <Badge rank={profile.season_rank} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2 border border-slate-700">
            <Coins className="w-5 h-5 text-accent-400" />
            <span className="font-bold text-white">{profile.coins.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
