-- Delete old duplicate loans that have timestamp patterns in loan_ref
-- These are identified by loan_ref containing a dash followed by a long number
-- Examples: NL-0022-1790345426065-40, HP-0489-1790428533195-8
-- We keep the new loans with simple references like NL-0022, HP-0489, LAND-0155

DELETE FROM loans
WHERE loan_ref ~ '-\d{13}-\d+$'
AND (
  loan_ref LIKE 'NL-%-%-%' OR
  loan_ref LIKE 'HP-%-%-%' OR
  loan_ref LIKE 'LAND-%-%-%'
);
