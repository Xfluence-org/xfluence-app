-- Make user_id nullable in instagram_accounts table
-- This allows storing Instagram profiles that aren't yet associated with a specific user
ALTER TABLE public.instagram_accounts 
ALTER COLUMN user_id DROP NOT NULL;