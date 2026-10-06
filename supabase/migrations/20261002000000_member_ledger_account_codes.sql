ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS member_account_code TEXT;

CREATE INDEX IF NOT EXISTS idx_loans_member_account_code
  ON public.loans (member_account_code);

UPDATE public.savings AS s
SET
  account_number = LEFT(
    COALESCE(
      s.account_code,
      CASE WHEN s.type = 'special' THEN '62131001' ELSE '63101001' END
    ),
    4
  ) || LPAD(e.employee_no, 4, '0'),
  account_code = COALESCE(
    s.account_code,
    CASE WHEN s.type = 'special' THEN '62131001' ELSE '63101001' END
  )
FROM public.employees AS e
WHERE e.id = s.employee_id
  AND e.employee_no ~ '^\d{1,4}$';

UPDATE public.loans AS l
SET member_account_code = LEFT(
  COALESCE(lp.account_code, '62101001'),
  4
) || LPAD(e.employee_no, 4, '0')
FROM public.employees AS e, public.loan_products AS lp
WHERE e.id = l.employee_id
  AND lp.id = l.loan_product_id
  AND e.employee_no ~ '^\d{1,4}$';
