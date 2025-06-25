
-- Add opportunity-specific fields to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN compensation_min integer, -- minimum compensation in cents
ADD COLUMN compensation_max integer, -- maximum compensation in cents  
ADD COLUMN is_public boolean DEFAULT false, -- whether it appears in opportunities
ADD COLUMN application_deadline date,
ADD COLUMN target_reach integer, -- minimum follower requirement
ADD COLUMN target_engagement_rate decimal(4,2); -- minimum engagement rate

-- Update existing campaigns to have opportunity data
UPDATE public.campaigns SET
  compensation_min = CASE 
    WHEN amount > 50000 THEN amount - 50000 
    ELSE amount 
  END, -- $500 less than amount (or same if amount is small)
  compensation_max = amount,
  is_public = true,
  application_deadline = due_date - interval '7 days'
WHERE status IN ('published', 'active');

-- Add RLS policy for public opportunities (anyone can view published opportunities)
DROP POLICY IF EXISTS "Anyone can view published campaigns" ON public.campaigns;
CREATE POLICY "Anyone can view published opportunities" ON public.campaigns 
FOR SELECT USING (is_public = true AND status = 'published');
