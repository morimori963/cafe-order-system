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

export type SelectedOption = {
  name: string;
  price?: number;
};

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_line_id: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  pickup_time: string | null;
  stripe_payment_intent_id: string | null;
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
  options?: { name: string }[] | null;
  created_at: string;
  menu_item?: MenuItem;
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
