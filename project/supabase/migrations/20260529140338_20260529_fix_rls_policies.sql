/*
  # Fix RLS policies for user registration

  1. Issues Fixed
    - Wallets table missing INSERT policy (causing registration failures)
    - Wallets table missing UPDATE policy for balance changes

  2. Changes
    - Add INSERT policy for authenticated users creating their own wallet
    - Add UPDATE policy for authenticated users updating their own wallet
*/

-- Add missing INSERT policy for wallets
CREATE POLICY "Users can create own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add missing UPDATE policy for wallets (for balance changes)
CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);