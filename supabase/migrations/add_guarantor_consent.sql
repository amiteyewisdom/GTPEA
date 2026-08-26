-- Add consent status fields to loan_guarantors table
ALTER TABLE loan_guarantors 
ADD COLUMN consent_status TEXT DEFAULT 'pending' CHECK (consent_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE loan_guarantors 
ADD COLUMN consent_responded_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE loan_guarantors 
ADD COLUMN consent_notes TEXT;

-- Create index for faster queries on consent status
CREATE INDEX idx_loan_guarantors_consent_status ON loan_guarantors(consent_status);
