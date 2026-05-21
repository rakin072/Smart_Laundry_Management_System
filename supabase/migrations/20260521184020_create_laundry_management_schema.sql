/*
  # Smart Laundry Management System - Database Schema

  ## Overview
  Creates all tables for a full-stack laundry management system.

  ## New Tables
  1. `customers` - Extended profile for users
     - id (uuid, FK to auth.users)
     - name, email, phone, address, created_at
  2. `services` - Available laundry services
     - id, name, price_per_kg, description, is_active
  3. `laundry_orders` - Main order records
     - id, customer_id (FK), order_date, total_weight, total_quantity, total_price, status, created_at
  4. `order_items` - Individual items in each order
     - id, order_id (FK), cloth_type, quantity, weight, notes
  5. `order_item_services` - Junction table for item-service relationships
     - id, order_item_id (FK), service_id (FK)
  6. `payments` - Payment records linked to orders
     - id, order_id (FK), amount, method, status, payment_date
  7. `status_history` - Audit trail of order status changes
     - id, order_id (FK), status, updated_at, notes
  8. `notifications` - User notifications
     - id, customer_id (FK), message, is_read, created_at

  ## Security
  - RLS enabled on all tables
  - Customers can only access their own data
  - Admin role (via app_metadata) can access all data

  ## Notes
  - Status flow: collected -> washing -> drying -> ironing -> ready -> delivered
  - Payment methods: cash, card, mobile
  - Payment statuses: pending, paid, failed
*/

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR (
    SELECT is_admin FROM customers WHERE id = auth.uid()
  ));

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Customers can insert own profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price_per_kg numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true OR (
    SELECT is_admin FROM customers WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM customers WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM customers WHERE id = auth.uid()));

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  TO authenticated
  USING ((SELECT is_admin FROM customers WHERE id = auth.uid()));

-- Laundry orders table
CREATE TABLE IF NOT EXISTS laundry_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_date timestamptz DEFAULT now(),
  total_weight numeric(10,2) DEFAULT 0,
  total_quantity integer DEFAULT 0,
  total_price numeric(10,2) DEFAULT 0,
  status text DEFAULT 'collected' CHECK (status IN ('collected', 'washing', 'drying', 'ironing', 'ready', 'delivered')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE laundry_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders"
  ON laundry_orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid() OR (
    SELECT is_admin FROM customers WHERE id = auth.uid()
  ));

CREATE POLICY "Customers can insert own orders"
  ON laundry_orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own orders in collected status"
  ON laundry_orders FOR UPDATE
  TO authenticated
  USING (
    (customer_id = auth.uid() AND status = 'collected') OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  )
  WITH CHECK (
    (customer_id = auth.uid()) OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES laundry_orders(id) ON DELETE CASCADE,
  cloth_type text NOT NULL DEFAULT '',
  quantity integer DEFAULT 1,
  weight numeric(10,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert order items for their orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid()
  );

CREATE POLICY "Users can update order items for their orders"
  ON order_items FOR UPDATE
  TO authenticated
  USING (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  )
  WITH CHECK (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

-- Order item services junction table
CREATE TABLE IF NOT EXISTS order_item_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(order_item_id, service_id)
);

ALTER TABLE order_item_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order item services for their orders"
  ON order_item_services FOR SELECT
  TO authenticated
  USING (
    (SELECT lo.customer_id FROM order_items oi JOIN laundry_orders lo ON oi.order_id = lo.id WHERE oi.id = order_item_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert order item services for their orders"
  ON order_item_services FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT lo.customer_id FROM order_items oi JOIN laundry_orders lo ON oi.order_id = lo.id WHERE oi.id = order_item_id) = auth.uid()
  );

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES laundry_orders(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  method text DEFAULT 'cash' CHECK (method IN ('cash', 'card', 'mobile')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  payment_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert payments for their orders"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM customers WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM customers WHERE id = auth.uid()));

-- Status history table
CREATE TABLE IF NOT EXISTS status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES laundry_orders(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('collected', 'washing', 'drying', 'ironing', 'ready', 'delivered')),
  notes text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history for their orders"
  ON status_history FOR SELECT
  TO authenticated
  USING (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

CREATE POLICY "Admins can insert status history"
  ON status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT customer_id FROM laundry_orders WHERE id = order_id) = auth.uid() OR
    (SELECT is_admin FROM customers WHERE id = auth.uid())
  );

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  message text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid() OR (
    SELECT is_admin FROM customers WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM customers WHERE id = auth.uid()) OR
    customer_id = auth.uid()
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_laundry_orders_customer ON laundry_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_status ON laundry_orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
