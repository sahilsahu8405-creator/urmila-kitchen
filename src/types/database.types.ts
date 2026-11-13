export type OrderStatus =
  | 'pending_whatsapp'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PartyEnquiryStatus =
  | 'new_enquiry'
  | 'contacted'
  | 'quotation_sent'
  | 'awaiting_confirmation'
  | 'advance_paid'
  | 'confirmed'
  | 'preparing'
  | 'completed'
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null; // NULL = Unpriced, NOT orderable for regular orders
  image_url: string | null;
  is_available: boolean;
  is_bestseller: boolean;
  is_party_special: boolean;
  dietary_flags: {
    is_veg?: boolean;
    is_vegan?: boolean;
    is_jain_available?: boolean;
    is_spicy?: boolean;
  } | null;
  min_party_qty: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface DeliverySlot {
  id: string;
  name: string;
  slot_type: 'lunch' | 'dinner' | 'all_day';
  start_time: string; // HH:mm:ss
  end_time: string;   // HH:mm:ss
  max_capacity: number;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  whatsapp_number: string;
  contact_phone: string;
  address: string;
  default_cutoff_time: string; // e.g. "20:00:00"
  min_advance_days: number;   // 1 for next day
  max_advance_days: number;   // 7
  min_order_amount: number;
  delivery_charge: number;
  is_ordering_paused: boolean;
  pause_banner_message: string | null;
  serving_pin_codes: string[];
  updated_at?: string;
}

export interface BusinessSchedule {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  is_open: boolean;
  open_time: string;
  close_time: string;
  created_at?: string;
}

export interface BusinessClosure {
  id: string;
  closure_type: 'single_closure' | 'holiday_range' | 'special_opening';
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  is_open_override: boolean; // TRUE for special opening day that overrides normal weekly closures
  reason: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_reference: string;
  lookup_token: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  locality: string | null;
  pin_code: string | null;
  landmark: string | null;
  delivery_instructions: string | null;
  delivery_date: string; // YYYY-MM-DD
  delivery_slot_id: string;
  delivery_type: 'delivery' | 'pickup';
  payment_preference?: 'UPI' | 'Cash on Delivery' | 'Card / Online' | string | null;
  order_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  order_status: OrderStatus;
  whatsapp_opened: boolean;
  items_snapshot: any[];
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  delivery_slot?: DeliverySlot;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  subtotal_price: number;
  special_instructions: string | null;
}

export interface PartyEnquiry {
  id: string;
  enquiry_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_type: string;
  event_date: string;
  required_time: string;
  guest_count: number;
  food_preferences: string | null;
  requested_dishes: string[];
  custom_dishes: string | null;
  approximate_budget: number | null;
  delivery_location: string;
  special_requirements: string | null;
  quoted_amount: number | null;
  advance_paid: number | null;
  advance_payment_reference: string | null;
  internal_notes: string | null;
  status: PartyEnquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url: string;
  caption: string | null;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
}

export interface CustomerReview {
  id: string;
  customer_name: string;
  rating: number; // 1 - 5
  review_text: string;
  dish_highlight: string | null;
  event_type: string | null;
  image_url: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at?: string;
}

export interface OwnerProfile {
  id: string; // references auth.users(id)
  email: string;
  full_name: string;
  role: 'owner';
  created_at?: string;
}

