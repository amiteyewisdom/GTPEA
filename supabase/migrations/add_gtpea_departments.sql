-- Add GTPEA-specific departments to the department enum
-- This is needed because the Excel file contains departments like 'Retail', 'Marketing', etc.

-- PostgreSQL doesn't support ALTER TYPE to add values directly, so we need to recreate the type
DO $$
BEGIN
    -- Create new enum with all existing values plus new ones (both lowercase and capitalized versions)
    CREATE TYPE department_new AS ENUM (
        'management', 'Management', 'finance', 'Finance', 'operations', 'hr', 'it', 'sales', 'legal', 'Legal', 'audit', 'Audit',
        'retail', 'Retail', 'marketing', 'Marketing', 'supply chain', 'Supply Chain', 
        'wholesale', 'Wholesale', 'plant 1', 'Plant 1', 'plant 2', 'Plant 2',
        'planning & org.', 'Planning & Org.', 'colour kitchen', 'Colour Kitchen', 
        'innov. & engraving', 'Innov. & Engraving', 'hseq', 'HSEQ',
        'continuous improvement', 'Continuous Improvement', 'energy', 'Energy', 
        'production', 'Production', 'it/technical', 'IT/Technical', 'it/bac', 'IT/BAC',
        'engineering', 'Engineering', 'human resource', 'Human Resource',
        'MD''s Office'
    );
    
    -- Convert existing data to new type
    ALTER TABLE employees ALTER COLUMN department TYPE department_new USING department::text::department_new;
    
    -- Drop old type
    DROP TYPE department;
    
    -- Rename new type to original name
    ALTER TYPE department_new RENAME TO department;
    
    -- Now convert all lowercase values to proper case
    UPDATE employees SET department = 'Retail' WHERE department = 'retail';
    UPDATE employees SET department = 'Marketing' WHERE department = 'marketing';
    UPDATE employees SET department = 'Supply Chain' WHERE department = 'supply chain';
    UPDATE employees SET department = 'Wholesale' WHERE department = 'wholesale';
    UPDATE employees SET department = 'Plant 1' WHERE department = 'plant 1';
    UPDATE employees SET department = 'Plant 2' WHERE department = 'plant 2';
    UPDATE employees SET department = 'Planning & Org.' WHERE department = 'planning & org.';
    UPDATE employees SET department = 'Colour Kitchen' WHERE department = 'colour kitchen';
    UPDATE employees SET department = 'Innov. & Engraving' WHERE department = 'innov. & engraving';
    UPDATE employees SET department = 'HSEQ' WHERE department = 'hseq';
    UPDATE employees SET department = 'Continuous Improvement' WHERE department = 'continuous improvement';
    UPDATE employees SET department = 'Energy' WHERE department = 'energy';
    UPDATE employees SET department = 'Production' WHERE department = 'production';
    UPDATE employees SET department = 'IT/Technical' WHERE department = 'it/technical';
    UPDATE employees SET department = 'IT/BAC' WHERE department = 'it/bac';
    UPDATE employees SET department = 'Engineering' WHERE department = 'engineering';
    UPDATE employees SET department = 'Human Resource' WHERE department = 'human resource';
    UPDATE employees SET department = 'Finance' WHERE department = 'finance';
    UPDATE employees SET department = 'Audit' WHERE department = 'audit';
    UPDATE employees SET department = 'Legal' WHERE department = 'legal';
    
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

-- Add password_changed_at column to employees table for first-time login detection
DO $$
BEGIN
    ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END $$;
