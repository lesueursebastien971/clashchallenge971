/*
  # GameArena - Initial Database Schema

  Creates the complete database structure for the competitive gaming platform.

  ## Tables Created:
  
  ### User Management
  - `profiles` - Extended user profiles (pseudo, avatar, bio, gaming info)
  - `user_platforms` - Gaming platform connections (Steam, Epic, etc.)
  
  ### Game Management  
  - `games` - Supported games catalog
  - `game_platforms` - Available platforms per game
  
  ### Challenge System
  - `challenges` - Match challenges between players
  - `challenge_results` - Match results and proof
  
  ### Economy System
  - `wallets` - Virtual credit wallets
  - `transactions` - Credit transaction history
  
  ### Ranking System
  - `rankings` - Player rankings per game
  - `leagues` - Seasonal leagues
  
  ### Social System
  - `friends` - Friend connections
  - `notifications` - User notifications
  
  ### Moderation
  - `reports` - User reports for moderation
  
  ## Security
  - Row Level Security enabled on ALL tables
  - Policies restrict access to authenticated users
  - Users can only access their own data
  - Public read access for rankings and games
*/

-- ===================
-- ENUMS & TYPES
-- ===================

CREATE TYPE challenge_status AS ENUM ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE transaction_type AS ENUM ('challenge_win', 'challenge_loss', 'bonus', 'penalty', 'refund', 'purchase');
CREATE TYPE ranking_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster');
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
CREATE TYPE notification_type AS ENUM ('challenge', 'friend', 'result', 'system', 'promotion', 'achievement');
CREATE TYPE skill_level AS ENUM ('beginner', 'casual', 'intermediate', 'advanced', 'expert', 'pro');

-- ===================
-- GAMES & PLATFORMS
-- ===================

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  cover_url text DEFAULT '',
  category text DEFAULT 'action',
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, platform)
);

-- ===================
-- USER PROFILES
-- ===================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  avatar_url text DEFAULT '',
  cover_url text DEFAULT '',
  bio text DEFAULT '',
  country text DEFAULT '',
  timezone text DEFAULT 'UTC',
  skill_level skill_level DEFAULT 'intermediate',
  is_verified boolean DEFAULT false,
  is_pro boolean DEFAULT false,
  is_online boolean DEFAULT false,
  last_seen_at timestamptz DEFAULT now(),
  stats jsonb DEFAULT '{}'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

CREATE TABLE IF NOT EXISTS user_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  platform text NOT NULL,
  gamer_id text DEFAULT '',
  is_primary boolean DEFAULT false,
  rank_tier ranking_tier DEFAULT 'bronze',
  rank_points int DEFAULT 0,
  games_played int DEFAULT 0,
  games_won int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON user_games(game_id);

-- ===================
-- CHALLENGES
-- ===================

CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  platform text NOT NULL,
  status challenge_status NOT NULL DEFAULT 'pending',
  credits_amount int NOT NULL DEFAULT 0,
  rules jsonb DEFAULT '{}'::jsonb,
  scheduled_for timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_opponent ON challenges(opponent_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_game ON challenges(game_id);

CREATE TABLE IF NOT EXISTS challenge_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid UNIQUE NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  winner_id uuid REFERENCES auth.users(id),
  loser_id uuid REFERENCES auth.users(id),
  is_draw boolean DEFAULT false,
  challenger_score int DEFAULT 0,
  opponent_score int DEFAULT 0,
  screenshot_url text DEFAULT '',
  proof_url text DEFAULT '',
  notes text DEFAULT '',
  reported_by uuid REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  is_disputed boolean DEFAULT false,
  dispute_reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_results_challenge ON challenge_results(challenge_id);

-- ===================
-- WALLET & TRANSACTIONS
-- ===================

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance int NOT NULL DEFAULT 100,
  total_earned int DEFAULT 0,
  total_spent int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount int NOT NULL,
  balance_before int NOT NULL,
  balance_after int NOT NULL,
  challenge_id uuid REFERENCES challenges(id),
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ===================
-- RANKINGS & LEAGUES
-- ===================

CREATE TABLE IF NOT EXISTS rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  global_rank int DEFAULT 0,
  game_rank int DEFAULT 0,
  tier ranking_tier DEFAULT 'bronze',
  points int DEFAULT 0,
  wins int DEFAULT 0,
  losses int DEFAULT 0,
  win_streak int DEFAULT 0,
  max_streak int DEFAULT 0,
  season text DEFAULT 'season-1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id, season)
);

CREATE INDEX IF NOT EXISTS idx_rankings_user ON rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_game ON rankings(game_id);
CREATE INDEX IF NOT EXISTS idx_rankings_points ON rankings(points DESC);

CREATE TABLE IF NOT EXISTS leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  season text NOT NULL,
  game_id uuid REFERENCES games(id),
  description text DEFAULT '',
  image_url text DEFAULT '',
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  rules jsonb DEFAULT '{}'::jsonb,
  prize_pool int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===================
-- SOCIAL & NOTIFICATIONS
-- ===================

CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status friend_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_id);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text DEFAULT '',
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ===================
-- MODERATION
-- ===================

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges(id),
  reason text NOT NULL,
  description text DEFAULT '',
  evidence_url text DEFAULT '',
  status text DEFAULT 'pending',
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolution_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_id);

-- ===================
-- ROW LEVEL SECURITY
-- ===================

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Games are publicly readable" ON games FOR SELECT USING (true);
CREATE POLICY "Game platforms are publicly readable" ON game_platforms FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User games policies
CREATE POLICY "Users can view all user games" ON user_games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own games" ON user_games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own games" ON user_games FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own games" ON user_games FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Users can view their challenges" ON challenges FOR SELECT TO authenticated USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "Users can create challenges" ON challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update their challenges" ON challenges FOR UPDATE TO authenticated USING (auth.uid() = challenger_id OR auth.uid() = opponent_id) WITH CHECK (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- Challenge results policies
CREATE POLICY "Users can view challenge results" ON challenge_results FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM challenges WHERE challenges.id = challenge_results.challenge_id AND (challenger_id = auth.uid() OR opponent_id = auth.uid())));
CREATE POLICY "Users can submit results" ON challenge_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Users can update results" ON challenge_results FOR UPDATE TO authenticated USING (auth.uid() = reported_by) WITH CHECK (auth.uid() = reported_by);

-- Wallets policies
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Rankings policies
CREATE POLICY "Rankings are publicly readable" ON rankings FOR SELECT USING (true);

-- Leagues policies
CREATE POLICY "Leagues are publicly readable" ON leagues FOR SELECT USING (true);

-- Friends policies
CREATE POLICY "Users can view their friends" ON friends FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friend requests" ON friends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friend requests" ON friends FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id) WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can delete friend relations" ON friends FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- ===================
-- INITIAL DATA
-- ===================

INSERT INTO games (name, slug, description, category, sort_order, image_url) VALUES
('Fortnite', 'fortnite', 'Battle royale phenomenon', 'battle_royale', 1, 'https://images.pexels.com/photos/7915366/pexels-photo-7915366.jpeg?auto=compress&cs=tinysrgb&w=400'),
('EA Sports FC 24', 'ea-fc-24', 'The new era of football gaming', 'sports', 2, 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Call of Duty', 'call-of-duty', 'Iconic FPS franchise', 'fps', 3, 'https://images.pexels.com/photo-7915366/pexels-photo-7915366.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Valorant', 'valorant', 'Tactical 5v5 shooter', 'fps', 4, 'https://images.pexels.com/photos/7915366/pexels-photo-7915366.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Rocket League', 'rocket-league', 'Soccer meets racing', 'sports', 5, 'https://images.pexels.com/photos/3822925/pexels-photo-3822925.jpeg?auto=compress&cs=tinysrgb&w=400'),
('League of Legends', 'league-of-legends', 'The most popular MOBA', 'moba', 6, 'https://images.pexels.com/photos/7915366/pexels-photo-7915366.jpeg?auto=compress&cs=tinysrgb&w=400');

INSERT INTO game_platforms (game_id, platform) 
SELECT g.id, p.platform FROM games g
CROSS JOIN (VALUES ('PS5'), ('Xbox'), ('PC'), ('Nintendo Switch')) AS p(platform)
WHERE g.slug IN ('fortnite', 'rocket-league', 'ea-fc-24');

INSERT INTO game_platforms (game_id, platform) 
SELECT g.id, p.platform FROM games g
CROSS JOIN (VALUES ('PS5'), ('Xbox'), ('PC')) AS p(platform)
WHERE g.slug IN ('call-of-duty');

INSERT INTO game_platforms (game_id, platform) 
SELECT g.id, 'PC' FROM games g
WHERE g.slug IN ('valorant', 'league-of-legends');
