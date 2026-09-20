-- ============================================================================
-- NexInsight Migration 00004: Supabase Storage Bucket & RLS Policies
-- Description: Ensures public storage bucket 'restaurant-assets' exists and
--              configures RLS policies for public view & admin CRUD access.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CREATE BUCKET (IF NOT EXISTS)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. STORAGE RLS POLICIES FOR 'restaurant-assets'
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view restaurant assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage restaurant assets" ON storage.objects;

CREATE POLICY "Public can view restaurant assets"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'restaurant-assets');

CREATE POLICY "Admins can manage restaurant assets"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'restaurant-assets' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'restaurant-assets' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
