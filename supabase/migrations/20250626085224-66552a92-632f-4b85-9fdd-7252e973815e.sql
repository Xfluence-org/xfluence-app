
-- Store Instagram account connections
CREATE TABLE public.instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  instagram_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT, -- Will encrypt later
  followers_count INTEGER,
  following_count INTEGER,
  media_count INTEGER,
  engagement_rate DECIMAL(5,2),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(instagram_user_id)
);

-- Enable RLS
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own Instagram account
CREATE POLICY "Users can view their own Instagram account" ON public.instagram_accounts
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own Instagram account" ON public.instagram_accounts
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own Instagram account" ON public.instagram_accounts
FOR UPDATE USING (user_id = auth.uid());
