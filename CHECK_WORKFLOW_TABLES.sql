-- Check task_workflow_states table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task_workflow_states'
ORDER BY ordinal_position;

-- Check campaign_tasks columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campaign_tasks'
AND column_name IN ('current_phase', 'phase_visibility', 'status', 'progress')
ORDER BY ordinal_position;

-- Check if there are any unique constraints on task_workflow_states
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'task_workflow_states'::regclass
AND contype = 'u';

-- Add missing columns if needed (run these if columns are missing)
-- ALTER TABLE task_workflow_states ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- ALTER TABLE campaign_tasks ADD COLUMN IF NOT EXISTS current_phase TEXT;

-- Fix for the upsert - find the actual constraint name
SELECT conname
FROM pg_constraint
WHERE conrelid = 'task_workflow_states'::regclass
AND contype IN ('u', 'p')
AND pg_get_constraintdef(oid) LIKE '%task_id%phase%';