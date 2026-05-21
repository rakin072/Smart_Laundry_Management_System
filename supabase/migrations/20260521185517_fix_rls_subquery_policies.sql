/*
  # Fix RLS Subquery Policies

  ## Overview
  The existing RLS policies on several tables use subqueries against the customers table
  to check `is_admin`. These subqueries cause 500 errors because they try to check
  `is_admin` even when the user doesn't yet have a customers row (e.g. right after signup).

  ## Changes
  - Rewrite customers SELECT policy to avoid recursive subquery
  - Rewrite laundry_orders, order_items, order_item_services policies to be simpler
  - Rewrite notifications INSERT policy to allow customer self-insert
  - All admin checks are removed from the customer-facing subquery path
*/

-- Fix customers SELECT policy (avoid recursive self-reference)
DROP POLICY IF EXISTS "Customers can view own profile" ON customers;
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Add a separate admin view policy
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c2 WHERE c2.id = auth.uid() AND c2.is_admin = true
    )
  );

-- Fix laundry_orders policies
DROP POLICY IF EXISTS "Customers can view own orders" ON laundry_orders;
CREATE POLICY "Customers can view own orders"
  ON laundry_orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Separate admin orders view
CREATE POLICY "Admins can view all orders"
  ON laundry_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true)
  );

DROP POLICY IF EXISTS "Customers can update own orders in collected status" ON laundry_orders;
CREATE POLICY "Customers can update own orders"
  ON laundry_orders FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Fix order_items policies
DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM laundry_orders lo
      WHERE lo.id = order_id AND lo.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update order items for their orders" ON order_items;
CREATE POLICY "Users can update order items for their orders"
  ON order_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM laundry_orders lo
      WHERE lo.id = order_id AND lo.customer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM laundry_orders lo
      WHERE lo.id = order_id AND lo.customer_id = auth.uid()
    )
  );

-- Fix order_item_services policies
DROP POLICY IF EXISTS "Users can view order item services for their orders" ON order_item_services;
CREATE POLICY "Users can view order item services for their orders"
  ON order_item_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN laundry_orders lo ON oi.order_id = lo.id
      WHERE oi.id = order_item_id AND lo.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert order item services for their orders" ON order_item_services;
CREATE POLICY "Users can insert order item services for their orders"
  ON order_item_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN laundry_orders lo ON oi.order_id = lo.id
      WHERE oi.id = order_item_id AND lo.customer_id = auth.uid()
    )
  );

-- Fix payments policies
DROP POLICY IF EXISTS "Users can view payments for their orders" ON payments;
CREATE POLICY "Users can view payments for their orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM laundry_orders lo WHERE lo.id = order_id AND lo.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert payments for their orders" ON payments;
CREATE POLICY "Users can insert payments for their orders"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM laundry_orders lo WHERE lo.id = order_id AND lo.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true));

-- Fix status_history policies
DROP POLICY IF EXISTS "Users can view status history for their orders" ON status_history;
CREATE POLICY "Users can view status history for their orders"
  ON status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM laundry_orders lo WHERE lo.id = order_id AND lo.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can insert status history" ON status_history;
CREATE POLICY "Anyone can insert status history for their own orders"
  ON status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM laundry_orders lo WHERE lo.id = order_id AND lo.customer_id = auth.uid())
  );

-- Fix notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications for themselves"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Admin policies for orders/payments/status
CREATE POLICY "Admins can insert status history"
  ON status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true)
  );

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true)
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true));

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true));

CREATE POLICY "Admins can update all orders"
  ON laundry_orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM customers c WHERE c.id = auth.uid() AND c.is_admin = true));
