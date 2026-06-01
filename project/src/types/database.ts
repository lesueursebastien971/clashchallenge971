export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string;
          cover_url: string;
          bio: string;
          country: string;
          timezone: string;
          skill_level: SkillLevel;
          is_verified: boolean;
          is_pro: boolean;
          is_online: boolean;
          last_seen_at: string;
          stats: Json;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          display_name?: string;
          avatar_url?: string;
          cover_url?: string;
          bio?: string;
          country?: string;
          timezone?: string;
          skill_level?: SkillLevel;
          is_verified?: boolean;
          is_pro?: boolean;
          is_online?: boolean;
          last_seen_at?: string;
          stats?: Json;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string;
          cover_url?: string;
          bio?: string;
          country?: string;
          timezone?: string;
          skill_level?: SkillLevel;
          is_verified?: boolean;
          is_pro?: boolean;
          is_online?: boolean;
          last_seen_at?: string;
          stats?: Json;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          cover_url: string;
          category: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          image_url?: string;
          cover_url?: string;
          category?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string;
          cover_url?: string;
          category?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_games: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          platform: string;
          gamer_id: string;
          is_primary: boolean;
          rank_tier: RankingTier;
          rank_points: number;
          games_played: number;
          games_won: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          platform: string;
          gamer_id?: string;
          is_primary?: boolean;
          rank_tier?: RankingTier;
          rank_points?: number;
          games_played?: number;
          games_won?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          platform?: string;
          gamer_id?: string;
          is_primary?: boolean;
          rank_tier?: RankingTier;
          rank_points?: number;
          games_played?: number;
          games_won?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          challenger_id: string;
          opponent_id: string;
          game_id: string;
          platform: string;
          status: ChallengeStatus;
          credits_amount: number;
          rules: Json;
          scheduled_for: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          challenger_id: string;
          opponent_id: string;
          game_id: string;
          platform: string;
          status?: ChallengeStatus;
          credits_amount?: number;
          rules?: Json;
          scheduled_for?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          challenger_id?: string;
          opponent_id?: string;
          game_id?: string;
          platform?: string;
          status?: ChallengeStatus;
          credits_amount?: number;
          rules?: Json;
          scheduled_for?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      challenge_results: {
        Row: {
          id: string;
          challenge_id: string;
          winner_id: string | null;
          loser_id: string | null;
          is_draw: boolean;
          challenger_score: number;
          opponent_score: number;
          screenshot_url: string;
          proof_url: string;
          notes: string;
          reported_by: string | null;
          verified_by: string | null;
          verified_at: string | null;
          is_disputed: boolean;
          dispute_reason: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          winner_id?: string | null;
          loser_id?: string | null;
          is_draw?: boolean;
          challenger_score?: number;
          opponent_score?: number;
          screenshot_url?: string;
          proof_url?: string;
          notes?: string;
          reported_by?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          is_disputed?: boolean;
          dispute_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          winner_id?: string | null;
          loser_id?: string | null;
          is_draw?: boolean;
          challenger_score?: number;
          opponent_score?: number;
          screenshot_url?: string;
          proof_url?: string;
          notes?: string;
          reported_by?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          is_disputed?: boolean;
          dispute_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          total_earned: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          total_earned?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          total_earned?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          wallet_id: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          balance_before: number;
          balance_after: number;
          challenge_id: string | null;
          description: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          balance_before: number;
          balance_after: number;
          challenge_id?: string | null;
          description?: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          user_id?: string;
          type?: TransactionType;
          amount?: number;
          balance_before?: number;
          balance_after?: number;
          challenge_id?: string | null;
          description?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      rankings: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          global_rank: number;
          game_rank: number;
          tier: RankingTier;
          points: number;
          wins: number;
          losses: number;
          win_streak: number;
          max_streak: number;
          season: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          global_rank?: number;
          game_rank?: number;
          tier?: RankingTier;
          points?: number;
          wins?: number;
          losses?: number;
          win_streak?: number;
          max_streak?: number;
          season?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          global_rank?: number;
          game_rank?: number;
          tier?: RankingTier;
          points?: number;
          wins?: number;
          losses?: number;
          win_streak?: number;
          max_streak?: number;
          season?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: FriendStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: FriendStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: FriendStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          data: Json;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message?: string;
          data?: Json;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          message?: string;
          data?: Json;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      challenge_status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
      transaction_type: 'challenge_win' | 'challenge_loss' | 'bonus' | 'penalty' | 'refund' | 'purchase';
      ranking_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
      friend_status: 'pending' | 'accepted' | 'declined' | 'blocked';
      notification_type: 'challenge' | 'friend' | 'result' | 'system' | 'promotion' | 'achievement';
      skill_level: 'beginner' | 'casual' | 'intermediate' | 'advanced' | 'expert' | 'pro';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type ChallengeStatus = Database['public']['Enums']['challenge_status'];
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type RankingTier = Database['public']['Enums']['ranking_tier'];
export type FriendStatus = Database['public']['Enums']['friend_status'];
export type NotificationType = Database['public']['Enums']['notification_type'];
export type SkillLevel = Database['public']['Enums']['skill_level'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];
export type UserGame = Database['public']['Tables']['user_games']['Row'];
export type Challenge = Database['public']['Tables']['challenges']['Row'];
export type ChallengeResult = Database['public']['Tables']['challenge_results']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Ranking = Database['public']['Tables']['rankings']['Row'];
export type Friend = Database['public']['Tables']['friends']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type UserGameInsert = Database['public']['Tables']['user_games']['Insert'];
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert'];
export type ChallengeResultInsert = Database['public']['Tables']['challenge_results']['Insert'];
export type WalletInsert = Database['public']['Tables']['wallets']['Insert'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type RankingInsert = Database['public']['Tables']['rankings']['Insert'];
export type FriendInsert = Database['public']['Tables']['friends']['Insert'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
