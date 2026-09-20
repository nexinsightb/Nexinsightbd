-- ============================================================================
-- NexInsight Migration 00003: Admin RLS Policies & Public Template Read Policy
-- Description: Grants full CRUD permissions on restaurants, restaurant_backends,
--              subscriptions, and restaurant_images to users with role = 'admin'.
--              Allows public read access for active restaurants.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- DROP EXISTING POLICIES IF THEY EXIST (FOR RE-RUN SAFETY)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins have full access to restaurant_backends" ON restaurant_backends;
DROP POLICY IF EXISTS "Admins have full access to subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins have full access to restaurant_images" ON restaurant_images;
DROP POLICY IF EXISTS "Public can view images for active restaurants" ON restaurant_images;

-- ----------------------------------------------------------------------------
-- 1. RESTAURANTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins have full access to restaurants"
  ON restaurants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can view active restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (manual_status = 'active');

-- ----------------------------------------------------------------------------
-- 2. RESTAURANT_BACKENDS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins have full access to restaurant_backends"
  ON restaurant_backends
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 3. SUBSCRIPTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins have full access to subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 4. RESTAURANT_IMAGES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins have full access to restaurant_images"
  ON restaurant_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can view images for active restaurants"
  ON restaurant_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_images.restaurant_id
        AND restaurants.manual_status = 'active'
    )
  );
