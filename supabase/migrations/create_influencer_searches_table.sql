-- Create influencer_searches table to track search analytics
CREATE TABLE IF NOT EXISTS influencer_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_params JSONB NOT NULL,
    results_count INTEGER NOT NULL DEFAULT 0,
    search_time_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_influencer_searches_user_id ON influencer_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_searches_created_at ON influencer_searches(created_at);

-- Enable RLS
ALTER TABLE influencer_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only see their own searches
CREATE POLICY "Users can view their own influencer searches" ON influencer_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own influencer searches" ON influencer_searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);