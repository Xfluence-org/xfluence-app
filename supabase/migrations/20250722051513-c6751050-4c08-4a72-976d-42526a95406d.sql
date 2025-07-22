-- Fix existing campaign participants that are accepted but missing current_stage
UPDATE campaign_participants 
SET current_stage = 'content_requirement'
WHERE status = 'accepted' 
AND current_stage IS NULL;