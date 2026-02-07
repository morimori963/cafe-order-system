export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  has_temperature: boolean;
  sort_order: number;
  created_at: string;
};

export type Temperature = "hot" | "ice";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  pickup_time: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  temperature: Temperature | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  temperature: Temperature | null;
  totalPrice: number;
};

export type CheckoutFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupTime: string;
  notes: string;
};
