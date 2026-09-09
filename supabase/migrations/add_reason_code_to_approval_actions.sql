-- Add reason_code column to approval_actions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'approval_actions' 
        AND column_name = 'reason_code'
    ) THEN
        ALTER TABLE approval_actions
        ADD COLUMN reason_code TEXT;
        
        RAISE NOTICE 'Added reason_code column to approval_actions table';
    ELSE
        RAISE NOTICE 'reason_code column already exists in approval_actions table';
    END IF;
END $$;
