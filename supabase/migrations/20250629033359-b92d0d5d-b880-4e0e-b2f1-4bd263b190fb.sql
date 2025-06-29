
-- Remove the redundant llm_campaign column from campaigns table
-- since we already have the data relationally linked through llm_interactions
ALTER TABLE public.campaigns DROP COLUMN IF EXISTS llm_campaign;
