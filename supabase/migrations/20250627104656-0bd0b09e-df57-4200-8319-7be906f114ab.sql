
-- Update campaigns table to support multiple categories and campaign validity
ALTER TABLE public.campaigns 
DROP COLUMN IF EXISTS category;

ALTER TABLE public.campaigns 
ADD COLUMN categories text[] DEFAULT ARRAY[]::text[];

-- Add campaign validity field (in days from creation)
ALTER TABLE public.campaigns 
ADD COLUMN campaign_validity_days integer;

-- Update existing campaigns to have categories as array
UPDATE public.campaigns 
SET categories = ARRAY['General']::text[] 
WHERE categories IS NULL OR array_length(categories, 1) IS NULL;
