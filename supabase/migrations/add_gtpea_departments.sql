-- Add GTPEA-specific departments to the department enum
-- This is needed because the Excel file contains departments like 'retail', 'marketing', etc.

-- PostgreSQL doesn't support ALTER TYPE to add values directly, so we need to recreate the type
DO $$
BEGIN
    -- Create new enum with all existing values plus new ones
    CREATE TYPE department_new AS ENUM (
        'management', 'finance', 'operations', 'hr', 'it', 'sales', 'legal', 'audit',
        'retail', 'marketing', 'supply chain', 'wholesale', 'plant 1', 'plant 2',
        'planning & org.', 'colour kitchen', 'innov. & engraving', 'hseq',
        'continuous improvement', 'energy', 'production', 'it/technical', 'it/bac'
    );
    
    -- Convert existing data to new type
    ALTER TABLE employees ALTER COLUMN department TYPE department_new USING department::text::department_new;
    
    -- Drop old type
    DROP TYPE department;
    
    -- Rename new type to original name
    ALTER TYPE department_new RENAME TO department;
    
EXCEPTION
    WHEN duplicate_object THEN
        -- If the migration already ran, do nothing
        NULL;
END $$;
