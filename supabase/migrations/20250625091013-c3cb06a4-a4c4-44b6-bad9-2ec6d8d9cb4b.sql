
-- Insert dummy opportunity data for testing the UI
-- First, let's ensure we have some brands to work with
INSERT INTO public.brands (id, name, logo_url) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Nike', 'https://logo.clearbit.com/nike.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Coca-Cola', 'https://logo.clearbit.com/coca-cola.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Apple', 'https://logo.clearbit.com/apple.com'),
  ('550e8400-e29b-41d4-a716-446655440004', 'McDonald''s', 'https://logo.clearbit.com/mcdonalds.com'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Tesla', 'https://logo.clearbit.com/tesla.com')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy opportunity campaigns
INSERT INTO public.campaigns (
  id,
  brand_id,
  title,
  description,
  category,
  compensation_min,
  compensation_max,
  requirements,
  due_date,
  application_deadline,
  status,
  is_public,
  target_reach,
  target_engagement_rate
) VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Nike Air Max Campaign',
    'Showcase the new Nike Air Max collection with authentic lifestyle content. Perfect for fitness and fashion influencers.',
    'Fashion',
    200000, -- $2,000
    300000, -- $3,000
    '{"posts": 2, "stories": 5, "reels": 1, "platforms": ["Instagram", "TikTok"]}',
    '2025-08-15',
    '2025-07-15',
    'published',
    true,
    50000,
    3.5
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Coca-Cola Summer Vibes',
    'Create refreshing summer content featuring Coca-Cola products. Great for lifestyle and travel creators.',
    'Food & Drinks',
    150000, -- $1,500
    250000, -- $2,500
    '{"posts": 3, "stories": 8, "reels": 2, "platforms": ["Instagram", "TikTok", "YouTube"]}',
    '2025-09-01',
    '2025-08-01',
    'published',
    true,
    30000,
    4.0
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'iPhone 16 Pro Review',
    'Comprehensive review and lifestyle integration of the new iPhone 16 Pro. Tech reviewers welcome.',
    'Technology',
    300000, -- $3,000
    500000, -- $5,000
    '{"posts": 1, "stories": 3, "reels": 3, "platforms": ["Instagram", "TikTok", "YouTube"]}',
    '2025-07-30',
    '2025-07-10',
    'published',
    true,
    100000,
    2.8
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    'McDonald''s Breakfast Menu',
    'Promote our new breakfast items with mouth-watering content. Food influencers preferred.',
    'Food & Drinks',
    100000, -- $1,000
    180000, -- $1,800
    '{"posts": 2, "stories": 4, "reels": 1, "platforms": ["Instagram", "TikTok"]}',
    '2025-08-20',
    '2025-07-20',
    'published',
    true,
    25000,
    3.2
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440005',
    'Tesla Model Y Adventure',
    'Document an epic road trip with the Tesla Model Y. Automotive and travel content creators wanted.',
    'Travel',
    400000, -- $4,000
    600000, -- $6,000
    '{"posts": 4, "stories": 10, "reels": 3, "platforms": ["Instagram", "TikTok", "YouTube"]}',
    '2025-09-15',
    '2025-08-15',
    'published',
    true,
    75000,
    3.0
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    'Nike Fitness Challenge',
    'Create motivational fitness content using Nike gear. 30-day transformation challenge.',
    'Fitness',
    250000, -- $2,500
    350000, -- $3,500
    '{"posts": 5, "stories": 15, "reels": 4, "platforms": ["Instagram", "TikTok"]}',
    '2025-08-30',
    '2025-07-30',
    'published',
    true,
    40000,
    4.5
  )
ON CONFLICT (id) DO NOTHING;
