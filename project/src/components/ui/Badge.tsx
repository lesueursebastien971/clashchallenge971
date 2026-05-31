import React from 'react';
import type { SeasonRank } from '../../types/database';

interface BadgeProps {
  rank: SeasonRank;
}

const rankStyles: Record<SeasonRank, string> = {
  Bronze: 'badge-bronze',
  Argent: 'badge-silver',
  Or: 'badge-gold',
  Diamant: 'badge-diamond',
  Maitre: 'badge-master',
};

export function Badge({ rank }: BadgeProps) {
  return (
    <span className={rankStyles[rank]}>
      {rank}
    </span>
  );
}
