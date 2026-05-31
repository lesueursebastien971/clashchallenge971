export interface User {
  id: string;
  auth_id: string;
  username: string;
  clash_royale_tag: string | null;
  avatar_url: string;
  level: number;
  coins: number;
  wins: number;
  losses: number;
  current_streak: number;
  best_streak: number;
  season_rank: SeasonRank;
  season_points: number;
  total_challenges: number;
  created_at: string;
  updated_at: string;
}

export type SeasonRank = 'Bronze' | 'Argent' | 'Or' | 'Diamant' | 'Maitre';

export interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  stake_amount: number;
  challenge_code: string;
  status: ChallengeStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  challenger?: User;
  opponent?: User;
}

export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'in_progress' | 'completed';

export interface Match {
  id: string;
  challenge_id: string;
  winner_id: string | null;
  loser_id: string | null;
  winner_confirmed: boolean;
  loser_confirmed: boolean;
  status: MatchStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  challenge?: Challenge;
  winner?: User;
  loser?: User;
}

export type MatchStatus = 'pending' | 'disputed' | 'completed';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
  friend?: User;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'challenge_received'
  | 'challenge_accepted'
  | 'challenge_declined'
  | 'match_win'
  | 'match_loss'
  | 'friend_request'
  | 'friend_accepted'
  | 'season_rank_up';

export interface Season {
  id: string;
  user_id: string;
  season_number: number;
  rank: SeasonRank;
  points: number;
  wins: number;
  losses: number;
  best_streak: number;
  created_at: string;
}

export interface Screenshot {
  id: string;
  match_id: string;
  user_id: string;
  image_url: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string;
  season_rank: SeasonRank;
  season_points: number;
  wins: number;
  losses: number;
  current_streak: number;
}

export const STAKE_AMOUNTS = [100, 250, 500, 1000] as const;
export type StakeAmount = typeof STAKE_AMOUNTS[number];

export const SEASON_RANKS: SeasonRank[] = ['Bronze', 'Argent', 'Or', 'Diamant', 'Maitre'];

export type UserProfile = User;
