-- ============================================================
-- Migration: 003 — Allow reading user profiles for public data
-- ============================================================

-- Reviews expose author data via GraphQL `Review.user`, so profile
-- reads must be allowed outside self-only access.
DROP POLICY IF EXISTS "users_public_read" ON public.users;
CREATE POLICY "users_public_read"
  ON public.users
  FOR SELECT
  USING (true);