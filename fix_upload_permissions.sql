-- Fix storage bucket permissions for campaign-assets
-- Run this in Supabase SQL Editor

-- 1. First, ensure the bucket exists and has proper configuration
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-assets',
  'campaign-assets',
  true, -- Make bucket public for read access
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Drop existing storage policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own uploads" ON storage.objects;

-- 3. Create new storage policies
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaign-assets' AND
  auth.uid()::text IS NOT NULL
);

-- Allow public to view all files (since bucket is public)
CREATE POLICY "Allow public to view uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-assets');

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaign-assets' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to update their own uploads
CREATE POLICY "Allow users to update own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'campaign-assets' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 4. Fix task_uploads table RLS policies
-- Enable RLS on task_uploads table
ALTER TABLE task_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view task uploads" ON task_uploads;
DROP POLICY IF EXISTS "Users can insert own uploads" ON task_uploads;
DROP POLICY IF EXISTS "Users can update own uploads" ON task_uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON task_uploads;

-- Create new policies for task_uploads table
-- Allow users to view uploads for tasks they're involved in
CREATE POLICY "Users can view task uploads"
ON task_uploads FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM campaign_tasks ct
    JOIN campaigns c ON c.id = ct.campaign_id
    LEFT JOIN campaign_participants cp ON cp.campaign_id = c.id
    WHERE ct.id = task_uploads.task_id
    AND (
      c.brand_id = auth.uid() OR -- Brand can see all uploads
      cp.influencer_id = auth.uid() -- Influencer can see uploads for their campaigns
    )
  )
);

-- Allow authenticated users to insert their own uploads
CREATE POLICY "Users can insert own uploads"
ON task_uploads FOR INSERT
TO authenticated
WITH CHECK (
  uploader_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM campaign_tasks ct
    JOIN campaigns c ON c.id = ct.campaign_id
    LEFT JOIN campaign_participants cp ON cp.campaign_id = c.id
    WHERE ct.id = task_uploads.task_id
    AND cp.influencer_id = auth.uid()
    AND cp.status = 'accepted'
  )
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON task_uploads FOR UPDATE
TO authenticated
USING (uploader_id = auth.uid())
WITH CHECK (uploader_id = auth.uid());

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON task_uploads FOR DELETE
TO authenticated
USING (uploader_id = auth.uid());

-- 5. Verify the policies are working
-- You can test by running these queries:
-- SELECT * FROM storage.buckets WHERE id = 'campaign-assets';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- SELECT * FROM pg_policies WHERE tablename = 'task_uploads';