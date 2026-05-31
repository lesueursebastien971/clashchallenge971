/*
  # Create Clash Challenge Database Schema

  1. New Tables
    - `users`: Player profiles with stats, virtual currency, and rankings
    - `challenges`: Duel invitations with stake amounts
    - `matches`: Completed games with results
    - `friends`: Friend relationships between players
    - `notifications`: User notifications for challenges, results, etc.
    - `seasons`: Seasonal rankings and progression
    - `screenshots`: Result verification images

  2. Security
    - Enable RLS on all tables
    - Policies restrict data access to authenticated users
    - Users can only access their own data and shared challenges

  3. Important Notes
    - Uses auth.uid() for user identification
    - Virtual currency (coins) starts at 1000 for new users
    - Season system tracks competitive progression
    - Challenge stakes are held in escrow until match completion
*/

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text UNIQUE NOT NULL,
  clash_royale_tag text UNIQUE,
  avatar_url text DEFAULT 'https://images.pexels.com/photos/163064/play-student-web-learning-163064.jpeg?auto=compress&cs=tinysrgb&w=150',
  level int DEFAULT 1,
  coins int DEFAULT 1000,
  wins int DEFAULT 0,
  losses int DEFAULT 0,
  current_streak int DEFAULT 0,
  best_streak int DEFAULT 0,
  season_rank text DEFAULT 'Bronze',
  season_points int DEFAULT 0,
  total_challenges int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  opponent_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  stake_amount int NOT NULL CHECK (stake_amount > 0),
  challenge_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'in_progress', 'completed')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  winner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  loser_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  winner_confirmed boolean DEFAULT false,
  loser_confirmed boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'disputed', 'completed')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('challenge_received', 'challenge_accepted', 'challenge_declined', 'match_win', 'match_loss', 'friend_request', 'friend_accepted', 'season_rank_up')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Seasons table
CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  season_number int NOT NULL,
  rank text NOT NULL DEFAULT 'Bronze',
  points int DEFAULT 0,
  wins int DEFAULT 0,
  losses int DEFAULT 0,
  best_streak int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, season_number)
);

-- Screenshots table
CREATE TABLE IF NOT EXISTS public.screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can view other users basic info"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() != auth_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Challenges policies
CREATE POLICY "Users can view their own challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = challenges.challenger_id
      AND users.auth_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = challenges.opponent_id
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = challenges.challenger_id
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update challenges they are part of"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = challenges.challenger_id
      AND users.auth_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = challenges.opponent_id
      AND users.auth_id = auth.uid()
    )
  );

-- Matches policies
CREATE POLICY "Users can view matches they participated in"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = matches.challenge_id
      AND (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = c.challenger_id
          AND users.auth_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = c.opponent_id
          AND users.auth_id = auth.uid()
        )
      )
    )
  );

-- Friends policies
CREATE POLICY "Users can view their own friendships"
  ON public.friends FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (users.id = friends.user_id OR users.id = friends.friend_id)
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can create friend requests"
  ON public.friends FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = friends.user_id
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their friendships"
  ON public.friends FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (users.id = friends.user_id OR users.id = friends.friend_id)
      AND users.auth_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = notifications.user_id
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = notifications.user_id
      AND users.auth_id = auth.uid()
    )
  );

-- Seasons policies
CREATE POLICY "Users can view own season data"
  ON public.seasons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = seasons.user_id
      AND users.auth_id = auth.uid()
    )
  );

-- Screenshots policies
CREATE POLICY "Users can view screenshots of their matches"
  ON public.screenshots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = screenshots.match_id
      AND (
        EXISTS (
          SELECT 1 FROM public.challenges c
          WHERE c.id = m.challenge_id
          AND (
            EXISTS (
              SELECT 1 FROM public.users
              WHERE users.id = c.challenger_id AND users.auth_id = auth.uid()
            )
            OR EXISTS (
              SELECT 1 FROM public.users
              WHERE users.id = c.opponent_id AND users.auth_id = auth.uid()
            )
          )
        )
      )
    )
  );

CREATE POLICY "Users can upload screenshots for their matches"
  ON public.screenshots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = screenshots.user_id
      AND users.auth_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON public.challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_opponent ON public.challenges(opponent_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_matches_challenge ON public.matches(challenge_id);
CREATE INDEX IF NOT EXISTS idx_friends_user ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_seasons_user ON public.seasons(user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();