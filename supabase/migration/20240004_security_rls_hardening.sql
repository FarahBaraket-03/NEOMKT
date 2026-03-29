-- ============================================================
-- Migration: 004 - Security hardening for RLS policies
-- ============================================================

-- Catalog tables must be publicly readable.
DROP POLICY IF EXISTS "brands_public_read" ON public.brands;
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "specs_public_read" ON public.specs;
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;

CREATE POLICY "brands_public_read"
  ON public.brands
  FOR SELECT
  USING (true);

CREATE POLICY "categories_public_read"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "products_public_read"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "specs_public_read"
  ON public.specs
  FOR SELECT
  USING (true);

CREATE POLICY "reviews_public_read"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Catalog writes are restricted to service_role.
DROP POLICY IF EXISTS "brands_admin_insert" ON public.brands;
DROP POLICY IF EXISTS "brands_admin_update" ON public.brands;
DROP POLICY IF EXISTS "brands_admin_delete" ON public.brands;
DROP POLICY IF EXISTS "categories_admin_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;
DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
DROP POLICY IF EXISTS "products_admin_update" ON public.products;
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
DROP POLICY IF EXISTS "specs_admin_write" ON public.specs;

CREATE POLICY "brands_service_role_insert"
  ON public.brands
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "brands_service_role_update"
  ON public.brands
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "brands_service_role_delete"
  ON public.brands
  FOR DELETE
  TO service_role
  USING (true);

CREATE POLICY "categories_service_role_insert"
  ON public.categories
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "categories_service_role_update"
  ON public.categories
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "categories_service_role_delete"
  ON public.categories
  FOR DELETE
  TO service_role
  USING (true);

CREATE POLICY "products_service_role_insert"
  ON public.products
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "products_service_role_update"
  ON public.products
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_service_role_delete"
  ON public.products
  FOR DELETE
  TO service_role
  USING (true);

CREATE POLICY "specs_service_role_insert"
  ON public.specs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "specs_service_role_update"
  ON public.specs
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "specs_service_role_delete"
  ON public.specs
  FOR DELETE
  TO service_role
  USING (true);

-- Reviews: authenticated users can insert their own rows.
-- Only owners or service_role can update/delete.
DROP POLICY IF EXISTS "reviews_auth_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_owner_update" ON public.reviews;
DROP POLICY IF EXISTS "reviews_owner_delete" ON public.reviews;
DROP POLICY IF EXISTS "reviews_service_role_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_service_role_update" ON public.reviews;
DROP POLICY IF EXISTS "reviews_service_role_delete" ON public.reviews;

CREATE POLICY "reviews_auth_insert"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_owner_update"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_owner_delete"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reviews_service_role_insert"
  ON public.reviews
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "reviews_service_role_update"
  ON public.reviews
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "reviews_service_role_delete"
  ON public.reviews
  FOR DELETE
  TO service_role
  USING (true);

-- Users: can only read/update own row and cannot self-elevate role.
DROP POLICY IF EXISTS "users_public_read" ON public.users;
DROP POLICY IF EXISTS "users_self_read" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;

CREATE POLICY "users_self_read"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_self_update"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (
      SELECT current_user_row.role
      FROM public.users AS current_user_row
      WHERE current_user_row.id = auth.uid()
    )
  );