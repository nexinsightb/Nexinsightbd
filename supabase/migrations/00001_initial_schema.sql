-- ============================================================================
-- NexInsight Initial Database Schema Migration
-- Migration File: supabase/migrations/00001_initial_schema.sql
-- Description: Creates core tables (restaurants, restaurant_images, 
--              restaurant_backends, subscriptions, profiles), indexes, 
--              updated_at triggers, and enables Row Level Security (RLS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. REUSABLE TRIGGER FUNCTION FOR UPDATED_AT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. TABLE: restaurants
-- Stores primary restaurant branding, public content, and status settings.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (length(slug) > 0),
  theme TEXT NOT NULL DEFAULT 'theme-1',
  manual_status TEXT NOT NULL DEFAULT 'draft' CHECK (manual_status IN ('draft', 'active', 'inactive', 'disabled')),

  -- Branding
  brand_logo_path TEXT,
  square_logo_path TEXT,

  -- Main Experience / Public Page Text
  main_title TEXT,
  google_review_url TEXT,
  google_button_text TEXT,
  feedback_button_text TEXT,

  -- Campaign / Birthday Club
  campaign_enabled BOOLEAN DEFAULT FALSE,
  campaign_title TEXT,
  campaign_description TEXT,
  campaign_button_text TEXT,

  -- Contact & Hours
  address TEXT,
  phone TEXT,
  opening_time TEXT,
  closing_time TEXT,
  closing_text TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for restaurants.updated_at
CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. TABLE: restaurant_images
-- Stores dish carousel & gallery image references (max 6 images per restaurant).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 1 AND sort_order <= 6),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_restaurant_images_sort UNIQUE (restaurant_id, sort_order)
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: restaurant_backends
-- Stores private Google Apps Script Web App endpoints per restaurant.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_backends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  feedback_backend_url TEXT,
  campaign_backend_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for restaurant_backends.updated_at
CREATE TRIGGER trg_restaurant_backends_updated_at
  BEFORE UPDATE ON restaurant_backends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5. TABLE: subscriptions
-- Stores plan details and expiration dates per restaurant.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  plan TEXT,
  start_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for subscriptions.updated_at
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. TABLE: profiles
-- Prepares user profile mapping between auth.users and restaurants.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  display_name TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for profiles.updated_at
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_manual_status ON restaurants(manual_status);

CREATE INDEX IF NOT EXISTS idx_restaurant_images_restaurant_id ON restaurant_images(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_images_sort ON restaurant_images(restaurant_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_restaurant_backends_restaurant_id ON restaurant_backends(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id ON subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON profiles(restaurant_id);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all application tables. Access policies will be added in
-- future tasks when authentication and owner access rules are implemented.
-- ----------------------------------------------------------------------------
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_backends ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
