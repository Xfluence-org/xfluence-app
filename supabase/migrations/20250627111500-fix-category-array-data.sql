
-- Fix the malformed array literals in the category column
-- First, let's see what we're working with and fix the data type issue

-- Update single text values to proper array format
UPDATE public.campaigns 
SET category = ARRAY[category[1]]::text[]
WHERE category IS NOT NULL 
  AND array_length(category, 1) = 1
  AND category[1] IS NOT NULL;

-- Set NULL categories to empty array  
UPDATE public.campaigns 
SET category = ARRAY[]::text[] 
WHERE category IS NULL;

-- Fix any remaining malformed entries by setting to General
UPDATE public.campaigns 
SET category = ARRAY['General']::text[] 
WHERE category IS NOT NULL 
  AND (array_length(category, 1) IS NULL OR array_length(category, 1) = 0);
