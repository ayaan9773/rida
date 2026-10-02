export type Language = 'en' | 'ar';

export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  name_en: string;
  name_ar: string;
  tagline_en: string;
  tagline_ar: string;
  phone: string;
  whatsapp: string;
  address_en: string;
  address_ar: string;
  google_rating: number;
  review_count: number;
  logo_url: string;
  hero_title_en: string;
  hero_title_ar: string;
  hero_subtitle_en: string;
  hero_subtitle_ar: string;
  hero_image_url: string;
  show_hero: boolean;
  hero_button_text_en: string;
  hero_button_text_ar: string;
  hero_button_link: string;
  instagram_url?: string;
  tiktok_url?: string;
  snapchat_url?: string;
  google_maps_url: string;
  primary_color: string;
  whatsapp_template_en: string;
  whatsapp_template_ar: string;
  email_config?: EmailConfig;
}

export interface EmailConfig {
  provider: 'supabase' | 'smtp' | 'resend' | 'sendgrid';
  sender_name: string;
  sender_email: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  api_key?: string;
  enable_verification: boolean;
  email_subject_en: string;
  email_subject_ar: string;
  email_template_en: string;
  email_template_ar: string;
}

export interface OpeningHour {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  day_name_en: string;
  day_name_ar: string;
  open_time: string; // e.g. "15:30"
  close_time: string; // e.g. "07:00"
  is_open: boolean;
}

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductVariant {
  name_en: string;
  name_ar: string;
  price: number;
}

export interface ProductExtra {
  name_en: string;
  name_ar: string;
  price: number;
}

export interface Product {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  discount_price?: number;
  image_url: string;
  images: string[];
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  sku?: string;
  sizes?: ProductVariant[];
  extras?: ProductExtra[];
}

export interface GalleryImage {
  id: string;
  title_en: string;
  title_ar: string;
  category: 'cafe' | 'coffee' | 'tea' | 'food' | 'outdoor' | 'bonfire' | 'interior' | 'evening';
  image_url: string;
  sort_order: number;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type OrderType = 'pickup' | 'dine_in' | 'delivery';

export interface CartItem {
  id: string; // generated unique id based on product id + variant/extras
  product: Product;
  quantity: number;
  selectedSize?: ProductVariant;
  selectedExtras?: ProductExtra[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name_en: string;
  product_name_ar: string;
  price: number;
  quantity: number;
  size_name_en?: string;
  size_name_ar?: string;
  extras?: string;
  item_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: OrderType;
  status: OrderStatus;
  table_number?: string;
  delivery_address?: string;
  notes?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CustomerReview {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  rating: number; // 1 to 5
  favorite_item?: string;
  comment: string;
  created_at: string;
  is_approved: boolean;
}

export type PaymentGatewayType = 'automatic' | 'manual';

export interface PaymentGateway {
  id: string;
  type: PaymentGatewayType;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  is_enabled: boolean;
  sort_order: number;
  provider?: 'moyasar' | 'tap' | 'hyperpay' | 'geidea' | 'stripe';
  is_test_mode?: boolean;
  public_key?: string;
  secret_key?: string;
  merchant_id?: string;
  bank_name_en?: string;
  bank_name_ar?: string;
  account_name?: string;
  iban?: string;
  account_number?: string;
  instructions_en?: string;
  instructions_ar?: string;
  qr_code_url?: string;
}

export type ViewMode =
  | 'home'
  | 'menu'
  | 'about'
  | 'gallery'
  | 'contact'
  | 'cart'
  | 'checkout'
  | 'profile'
  | 'my-orders'
  | 'order-tracking'
  | 'login'
  | 'privacy'
  | 'terms'
  | 'admin';
