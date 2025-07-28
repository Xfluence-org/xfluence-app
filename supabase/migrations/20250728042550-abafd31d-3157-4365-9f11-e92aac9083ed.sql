-- Add missing fields to instagram_accounts table for proper Instagram profile data storage
ALTER TABLE instagram_accounts 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS following INTEGER;

-- Update existing followers_count column to be consistent with the API guide
-- (it should already exist but ensuring proper type)
ALTER TABLE instagram_accounts 
ALTER COLUMN followers_count TYPE BIGINT;