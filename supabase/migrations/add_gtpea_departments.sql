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

-- Add GTPEA-specific savings types to the savings_type enum
-- This is needed because the import uses 'savings' and 'quick_cash' types
DO $$
BEGIN
    -- Remove default value temporarily
    ALTER TABLE savings ALTER COLUMN type DROP DEFAULT;
    
    -- Create new enum with all existing values plus new ones
    CREATE TYPE savings_type_new AS ENUM (
        'regular', 'special', 'emergency', 'retirement', 'savings', 'quick_cash'
    );
    
    -- Convert existing data to new type
    ALTER TABLE savings ALTER COLUMN type TYPE savings_type_new USING type::text::savings_type_new;
    
    -- Drop old type
    DROP TYPE savings_type;
    
    -- Rename new type to original name
    ALTER TYPE savings_type_new RENAME TO savings_type;
    
    -- Set default value back
    ALTER TABLE savings ALTER COLUMN type SET DEFAULT 'regular';
    
EXCEPTION
    WHEN duplicate_object THEN
        -- If the migration already ran, do nothing
        NULL;
END $$;
