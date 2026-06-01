/*
  # Fix RLS policies to allow signup

  1. Issue
    - During signup, the user is not yet considered "authenticated" in RLS context
    - Policies check `auth.uid() = user_id` but the new user has no session yet
    - This prevents profile and wallet insertion during registration

  2. Solution
    - Create public policies for NEW users to insert their own profile and wallet
    - Users can only insert if the user_id matches their auth.uid() after session creation
    - The JWT token is available immediately after signUp
*/

-- Drop and recreate the INSERT policy for profiles to allow public access with proper checks
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Drop and recreate the INSERT policy for wallets to allow public access with proper checks
DROP POLICY IF EXISTS "Users can create own wallet" ON wallets;

CREATE POLICY "Users can create own wallet"
  ON wallets FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);