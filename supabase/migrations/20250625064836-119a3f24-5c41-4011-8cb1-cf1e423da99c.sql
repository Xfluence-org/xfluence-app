
-- Create brands table
CREATE TABLE public.brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create campaigns table with JSONB requirements
CREATE TABLE public.campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.brands(id),
  title text NOT NULL,
  description text,
  category text,
  amount integer, -- cents
  budget integer, -- total campaign budget in cents
  requirements jsonb,
  due_date date,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create campaign participants table (the key relationship table)
CREATE TABLE public.campaign_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'invited',
  progress integer DEFAULT 0,
  current_stage text DEFAULT 'content_requirement',
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(campaign_id, influencer_id)
);

-- Enable RLS on all tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brands (public read access)
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (true);

-- RLS Policies for campaigns (public read for published campaigns)
CREATE POLICY "Anyone can view published campaigns" ON public.campaigns 
FOR SELECT USING (status = 'published' OR status = 'active');

-- RLS Policies for campaign_participants (users can only see their own participations)
CREATE POLICY "Users can view their own campaign participations" ON public.campaign_participants
FOR SELECT USING (influencer_id = auth.uid());

CREATE POLICY "Users can update their own campaign participations" ON public.campaign_participants
FOR UPDATE USING (influencer_id = auth.uid());

-- Insert sample brands
INSERT INTO public.brands (name) VALUES 
('Nike'),
('Starbucks'),
('Adidas'),
('Samsung');

-- Insert sample campaigns with the hardcoded data
INSERT INTO public.campaigns (brand_id, title, amount, due_date, requirements, status) 
SELECT 
  b.id,
  CASE 
    WHEN b.name = 'Nike' THEN 'Summertime Collection Launch'
    WHEN b.name = 'Starbucks' THEN 'Holiday Drinks Campaign'
    WHEN b.name = 'Adidas' THEN 'Fitness Motivation'
    WHEN b.name = 'Samsung' THEN 'Galaxy S25 Review'
  END as title,
  CASE 
    WHEN b.name = 'Nike' THEN 200000
    WHEN b.name = 'Starbucks' THEN 150000
    WHEN b.name = 'Adidas' THEN 180000
    WHEN b.name = 'Samsung' THEN 220000
  END as amount,
  CASE 
    WHEN b.name IN ('Nike', 'Starbucks') THEN '2025-06-24'::date
    ELSE '2025-07-15'::date
  END as due_date,
  CASE 
    WHEN b.name = 'Nike' THEN '{"posts": 2, "stories": 3}'::jsonb
    WHEN b.name = 'Starbucks' THEN '{"reels": 3, "stories": 2}'::jsonb
    WHEN b.name = 'Adidas' THEN '{"posts": 1, "stories": 2}'::jsonb
    WHEN b.name = 'Samsung' THEN '{"reels": 1, "posts": 1}'::jsonb
  END as requirements,
  CASE 
    WHEN b.name IN ('Nike', 'Starbucks') THEN 'published'
    ELSE 'active'
  END as status
FROM public.brands b;

-- Insert sample campaign participations (you'll need to replace 'your-user-id' with actual user IDs)
-- This will create the invitations and active campaigns for the current user
-- Note: This part will need actual user IDs once users are registered
INSERT INTO public.campaign_participants (campaign_id, influencer_id, status, progress, current_stage)
SELECT 
  c.id,
  auth.uid(),
  CASE 
    WHEN c.status = 'published' THEN 'invited'
    ELSE 'accepted'
  END as status,
  CASE 
    WHEN c.status = 'published' THEN 0
    WHEN c.title = 'Fitness Motivation' THEN 75
    WHEN c.title = 'Galaxy S25 Review' THEN 50
  END as progress,
  CASE 
    WHEN c.status = 'published' THEN 'content_requirement'
    WHEN c.title = 'Fitness Motivation' THEN 'brand_review'
    WHEN c.title = 'Galaxy S25 Review' THEN 'content_draft'
  END as current_stage
FROM public.campaigns c
WHERE auth.uid() IS NOT NULL;
