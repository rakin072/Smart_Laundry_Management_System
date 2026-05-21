import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type OrderStatus =
  | "collected"
  | "washing"
  | "drying"
  | "ironing"
  | "ready"
  | "delivered";

export type PaymentMethod = "cash" | "card" | "mobile";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  is_admin: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_per_kg: number;
  is_active: boolean;
  created_at: string;
}

export interface LaundryOrder {
  id: string;
  customer_id: string;
  order_date: string;
  total_weight: number;
  total_quantity: number;
  total_price: number;
  status: OrderStatus;
  notes: string;
  created_at: string;
  customers?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  cloth_type: string;
  quantity: number;
  weight: number;
  notes: string;
  created_at: string;
  order_item_services?: OrderItemService[];
}

export interface OrderItemService {
  id: string;
  order_item_id: string;
  service_id: string;
  services?: Service;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string | null;
  created_at: string;
  laundry_orders?: LaundryOrder;
}

export interface StatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  customer_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
