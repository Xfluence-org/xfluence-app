-- Add unique constraint on username column for Instagram accounts
ALTER TABLE public.instagram_accounts 
ADD CONSTRAINT instagram_accounts_username_unique UNIQUE (username);