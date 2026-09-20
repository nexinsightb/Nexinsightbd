-- ============================================================================
-- NexInsight Migration 00002: Profile SELECT RLS Policy
-- Description: Allows authenticated users to view their own profile record
--              so role verification (role = 'admin') can function securely.
-- ============================================================================

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
