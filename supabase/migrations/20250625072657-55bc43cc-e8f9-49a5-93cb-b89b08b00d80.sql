
-- Allow everyone to view public opportunities
CREATE POLICY "Anyone can view public opportunities" ON public.campaigns 
FOR SELECT USING (is_public = true AND status = 'published');

-- Allow influencers to apply to public campaigns
CREATE POLICY "Influencers can apply to public campaigns" ON public.campaign_participants 
FOR INSERT WITH CHECK (
  influencer_id = auth.uid() 
  AND campaign_id IN (
    SELECT id FROM public.campaigns 
    WHERE is_public = true AND status = 'published'
  )
);
