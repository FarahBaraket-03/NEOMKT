-- ============================================================
-- Migration: 001 — Initial schema for Tech Products & Gadgets
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('PUBLIC', 'USER', 'ADMIN');
CREATE TYPE product_status AS ENUM ('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK');

-- ─────────────────────────────────────────
-- TABLE: users
-- NOTE: Supabase Auth manages auth.users.
-- This table extends it with app-level fields.
-- ─────────────────────────────────────────

CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  username    TEXT NOT NULL UNIQUE,
  role        user_role NOT NULL DEFAULT 'USER',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE: brands
-- ─────────────────────────────────────────

CREATE TABLE public.brands (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL UNIQUE,
  slug         TEXT NOT NULL UNIQUE,
  country      TEXT,
  logo_url     TEXT,
  website_url  TEXT,
  founded_year INT CHECK (founded_year > 1800 AND founded_year <= EXTRACT(YEAR FROM NOW())),
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE: categories
-- Self-referencing for parent/subcategory tree
-- ─────────────────────────────────────────

CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE: products
-- ─────────────────────────────────────────

CREATE TABLE public.products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock        INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status       product_status NOT NULL DEFAULT 'ACTIVE',
  brand_id     UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
  category_id  UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  image_url    TEXT,
  images       TEXT[] DEFAULT '{}',
  release_date DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search vector column
ALTER TABLE public.products ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english',
      COALESCE(name, '') || ' ' ||
      COALESCE(description, '')
    )
  ) STORED;

-- ─────────────────────────────────────────
-- TABLE: specs
-- Key-value pairs per product (RAM: 16GB, etc.)
-- ─────────────────────────────────────────

CREATE TABLE public.specs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  unit        TEXT,
  display_order INT DEFAULT 0,
  UNIQUE (product_id, key)
);

-- ─────────────────────────────────────────
-- TABLE: reviews
-- ─────────────────────────────────────────

CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       TEXT,
  comment     TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One review per user per product
  UNIQUE (product_id, user_id)
);

-- ─────────────────────────────────────────
-- TABLE: wishlist_items
-- ─────────────────────────────────────────

CREATE TABLE public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

-- Products: most common filters
CREATE INDEX idx_products_brand_id     ON public.products(brand_id);
CREATE INDEX idx_products_category_id  ON public.products(category_id);
CREATE INDEX idx_products_status       ON public.products(status);
CREATE INDEX idx_products_price        ON public.products(price);
CREATE INDEX idx_products_created_at   ON public.products(created_at DESC);

-- Full-text search
CREATE INDEX idx_products_search ON public.products USING GIN(search_vector);

-- Trigram index for ILIKE queries
CREATE INDEX idx_products_name_trgm ON public.products USING GIN(name gin_trgm_ops);

-- Reviews
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id    ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating     ON public.reviews(rating);

-- Specs
CREATE INDEX idx_specs_product_id ON public.specs(product_id);

-- Categories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug      ON public.categories(slug);

-- Wishlist
CREATE INDEX idx_wishlist_user_id ON public.wishlist_items(user_id);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Brands: public read, admin write
CREATE POLICY "brands_public_read"  ON public.brands FOR SELECT USING (true);
CREATE POLICY "brands_admin_insert" ON public.brands FOR INSERT WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "brands_admin_update" ON public.brands FOR UPDATE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "brands_admin_delete" ON public.brands FOR DELETE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- Categories: public read, admin write
CREATE POLICY "categories_public_read"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_insert" ON public.categories FOR INSERT WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "categories_admin_update" ON public.categories FOR UPDATE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- Products: public read, admin write
CREATE POLICY "products_public_read"  ON public.products FOR SELECT USING (status != 'DISCONTINUED' OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');
CREATE POLICY "products_admin_insert" ON public.products FOR INSERT WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "products_admin_update" ON public.products FOR UPDATE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- Specs: public read, admin write
CREATE POLICY "specs_public_read"  ON public.specs FOR SELECT USING (true);
CREATE POLICY "specs_admin_write"  ON public.specs FOR ALL USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- Reviews: public read, owner write
CREATE POLICY "reviews_public_read"   ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert"   ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_owner_update"  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_owner_delete"  ON public.reviews FOR DELETE USING (
  auth.uid() = user_id OR
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- Users: self read/write
CREATE POLICY "users_self_read"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_self_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Wishlist: owner only
CREATE POLICY "wishlist_owner"    ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- SUPABASE REALTIME — enable tables
-- ─────────────────────────────────────────

-- Enable Realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist_items;

-- ─────────────────────────────────────────
-- HELPER VIEW: products with avg rating
-- ─────────────────────────────────────────

CREATE VIEW public.products_with_stats AS
SELECT
  p.*,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,1) AS avg_rating,
  COUNT(r.id)::INT                          AS review_count
FROM public.products p
LEFT JOIN public.reviews r ON r.product_id = p.id
GROUP BY p.id;
