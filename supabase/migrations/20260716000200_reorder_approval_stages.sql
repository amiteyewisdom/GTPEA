BEGIN;

DELETE FROM public.approval_actions AS action
USING public.approvals AS approval
WHERE action.approval_id = approval.id
  AND approval.status = 'pending'
  AND action.required_role = 'union_rep'
  AND NOT EXISTS (
    SELECT 1
    FROM public.approval_actions AS fund_action
    WHERE fund_action.approval_id = approval.id
      AND fund_action.required_role = 'fund_manager'
      AND fund_action.action = 'approved'
  );

UPDATE public.approval_actions
SET stage = -stage
WHERE required_role IN ('fund_manager', 'union_rep');

UPDATE public.approval_actions
SET stage = CASE required_role
  WHEN 'fund_manager' THEN 1
  WHEN 'union_rep' THEN 2
END
WHERE required_role IN ('fund_manager', 'union_rep');

UPDATE public.approvals AS approval
SET current_stage = CASE
  WHEN EXISTS (
    SELECT 1
    FROM public.approval_actions AS trustee_action
    WHERE trustee_action.approval_id = approval.id
      AND trustee_action.stage = 2
      AND trustee_action.action = 'approved'
  ) THEN 3
  WHEN EXISTS (
    SELECT 1
    FROM public.approval_actions AS fund_action
    WHERE fund_action.approval_id = approval.id
      AND fund_action.stage = 1
      AND fund_action.action = 'approved'
  ) THEN 2
  ELSE 1
END
WHERE approval.status = 'pending';

COMMIT;
