/*
  # Seed Services Data

  ## Overview
  Inserts default laundry services with pricing.

  ## New Data
  - 6 laundry service types with price_per_kg values
  - These are default services available to all customers

  ## Notes
  - Prices are per kilogram in USD
  - All services are active by default
*/

INSERT INTO services (name, description, price_per_kg, is_active) VALUES
  ('Wash & Fold', 'Standard washing and folding service for everyday clothes', 3.50, true),
  ('Dry Cleaning', 'Professional dry cleaning for delicate fabrics and formal wear', 12.00, true),
  ('Ironing & Pressing', 'Professional ironing and pressing service for wrinkle-free clothes', 4.00, true),
  ('Wash & Iron', 'Complete wash, dry, and iron service for all clothing types', 6.50, true),
  ('Duvet & Blanket Wash', 'Specialized washing for duvets, blankets, and bedding', 8.00, true),
  ('Express Service', 'Same-day express laundry service (24-hour turnaround)', 15.00, true)
ON CONFLICT DO NOTHING;
