/*
  # Fix Services RLS Policy

  ## Change
  Simplify the SELECT policy on services so all authenticated users can view active services
  without a subquery that may cause issues for new accounts without customer profiles.
*/

DROP POLICY IF EXISTS "Anyone authenticated can view active services" ON services;

CREATE POLICY "Authenticated users can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);
