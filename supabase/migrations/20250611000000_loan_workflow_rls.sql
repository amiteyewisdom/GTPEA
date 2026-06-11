-- Loan application workflow: let employees submit approvals and let union reps act on them.

DROP POLICY IF EXISTS "Admins and approvers can manage approvals" ON approvals;

DROP POLICY IF EXISTS "Employees can submit approvals" ON approvals;
CREATE POLICY "Employees can submit approvals"
  ON approvals FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid()
    AND current_user_role() = 'employee'
  );

DROP POLICY IF EXISTS "Approvers can update approvals" ON approvals;
CREATE POLICY "Approvers can update approvals"
  ON approvals FOR UPDATE
  USING (
    current_user_role() IN (
      'super_admin',
      'administrator',
      'union_rep',
      'fund_manager',
      'chairperson'
    )
  );

DROP POLICY IF EXISTS "Admins can delete approvals" ON approvals;
CREATE POLICY "Admins can delete approvals"
  ON approvals FOR DELETE
  USING (current_user_role() IN ('super_admin', 'administrator'));

DROP POLICY IF EXISTS "Admins and fund managers can update loans" ON loans;
DROP POLICY IF EXISTS "Staff can update loans during workflow" ON loans;
CREATE POLICY "Staff can update loans during workflow"
  ON loans FOR UPDATE
  USING (
    current_user_role() IN (
      'super_admin',
      'administrator',
      'fund_manager',
      'chairperson'
    )
  );

DROP POLICY IF EXISTS "Approvers can insert approval actions" ON approval_actions;
CREATE POLICY "Approvers can insert approval actions"
  ON approval_actions FOR INSERT
  WITH CHECK (
    current_user_role() IN (
      'super_admin',
      'administrator',
      'union_rep',
      'fund_manager',
      'chairperson'
    )
  );
