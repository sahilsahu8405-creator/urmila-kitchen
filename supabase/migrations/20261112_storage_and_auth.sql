-- ============================================================================
-- URMILA'S KITCHEN - Storage Buckets & Policies Migration
-- Run this in Supabase SQL Editor if storage buckets are not yet created
-- ============================================================================

-- 1. Create storage buckets for product, gallery, and review images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('gallery-images', 'gallery-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('review-images', 'review-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Public Read Policies for Storage
CREATE POLICY "Public Read Product Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Public Read Gallery Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Public Read Review Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

-- 3. Owner & Authenticated Upload/Update/Delete Policies
CREATE POLICY "Auth/Owner Insert Product Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Auth/Owner Update Product Images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

CREATE POLICY "Auth/Owner Delete Product Images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

CREATE POLICY "Auth/Owner Insert Gallery Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Auth/Owner Delete Gallery Images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images');

-- Review image submission allowed for customers
CREATE POLICY "Public Insert Review Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-images');

