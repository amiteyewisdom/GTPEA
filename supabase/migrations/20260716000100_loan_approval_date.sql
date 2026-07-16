ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

UPDATE public.loans AS loan
SET approved_at = approval.completed_at
FROM public.approvals AS approval
WHERE approval.entity_type = 'loan'
  AND approval.entity_id = loan.id
  AND approval.status = 'approved'
  AND loan.approved_at IS NULL;
