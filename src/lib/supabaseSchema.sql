-- ====================================================================
-- GULF SPRING / نبع الدرعيه - COMPLETE SUPABASE SQL SCHEMA & RLS POLICIES
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Business Settings Table
CREATE TABLE IF NOT EXISTS public.business_settings (
  id TEXT PRIMARY KEY DEFAULT 'gulf-spring-settings-01',
  name_en TEXT NOT NULL DEFAULT 'Gulf Spring',
  name_ar TEXT NOT NULL DEFAULT 'نبع الدرعيه',
  tagline_en TEXT DEFAULT 'Coffee, Tea & Cozy Moments in Diriyah',
  tagline_ar TEXT DEFAULT 'قهوة وشاي ولحظات جميلة في الدرعية',
  phone TEXT NOT NULL DEFAULT '+966 55 707 0172',
  whatsapp TEXT NOT NULL DEFAULT '+966557070172',
  address_en TEXT NOT NULL DEFAULT '4210 Imam Faisal Bin Turki, Diriyah, Riyadh',
  address_ar TEXT NOT NULL DEFAULT '4210 الامام فيصل بن تركي، الدرعية، الرياض',
  google_rating NUMERIC(2, 1) DEFAULT 3.7,
  review_count INTEGER DEFAULT 1627,
  logo_url TEXT,
  hero_title_en TEXT DEFAULT 'Gulf Spring',
  hero_title_ar TEXT DEFAULT 'نبع الدرعيه',
  hero_subtitle_en TEXT DEFAULT 'Coffee, Tea & Cozy Moments in Diriyah',
  hero_subtitle_ar TEXT DEFAULT 'قهوة وشاي ولحظات جميلة في الدرعية',
  hero_image_url TEXT,
  show_hero BOOLEAN DEFAULT TRUE,
  hero_button_text_en TEXT DEFAULT 'View Menu',
  hero_button_text_ar TEXT DEFAULT 'تصفح المنيو',
  hero_button_link TEXT DEFAULT 'menu',
  instagram_url TEXT,
  tiktok_url TEXT,
  snapchat_url TEXT,
  google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=4210+Imam+Faisal+Bin+Turki+Diriyah+Riyadh',
  primary_color TEXT DEFAULT '#4a2e1b',
  whatsapp_template_en TEXT,
  whatsapp_template_ar TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Opening Hours Table
CREATE TABLE IF NOT EXISTS public.opening_hours (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  day_name_en TEXT NOT NULL,
  day_name_ar TEXT NOT NULL,
  open_time TEXT NOT NULL DEFAULT '15:30',
  close_time TEXT NOT NULL DEFAULT '07:00',
  is_open BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT ('cat-' || uuid_generate_v4()),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod-' || uuid_generate_v4()),
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_price NUMERIC(10, 2),
  image_url TEXT,
  images JSONB DEFAULT '[]'::JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  sku TEXT,
  sizes JSONB DEFAULT '[]'::JSONB,
  extras JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id TEXT PRIMARY KEY DEFAULT ('gal-' || uuid_generate_v4()),
  title_en TEXT,
  title_ar TEXT,
  category TEXT NOT NULL CHECK (category IN ('cafe', 'coffee', 'tea', 'food', 'outdoor', 'bonfire', 'interior', 'evening')),
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord-' || uuid_generate_v4()),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('pickup', 'dine_in', 'delivery')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  table_number TEXT,
  delivery_address TEXT,
  notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT ('item-' || uuid_generate_v4()),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_en TEXT NOT NULL,
  product_name_ar TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size_name_en TEXT,
  size_name_ar TEXT,
  extras TEXT,
  item_total NUMERIC(10, 2) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Current User an Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins full manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Business Settings: Public read, Admin write
CREATE POLICY "Public read business settings" ON public.business_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin update business settings" ON public.business_settings
  FOR ALL USING (public.is_admin());

-- Opening Hours: Public read, Admin write
CREATE POLICY "Public read opening hours" ON public.opening_hours
  FOR SELECT USING (true);

CREATE POLICY "Admin update opening hours" ON public.opening_hours
  FOR ALL USING (public.is_admin());

-- Categories: Public read active, Admin full manage
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- Products: Public read available, Admin full manage
CREATE POLICY "Public read available products" ON public.products
  FOR SELECT USING (is_available = true OR public.is_admin());

CREATE POLICY "Admin manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- Gallery: Public read, Admin full manage
CREATE POLICY "Public read gallery" ON public.gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Admin manage gallery" ON public.gallery_images
  FOR ALL USING (public.is_admin());

-- Orders: Anyone can create order, Customers read their own, Admin manage all
CREATE POLICY "Anyone can create order" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());

CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order Items: Anyone can insert items for new order, Users read own order items
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Read order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR public.is_admin())
    )
  );

-- ====================================================================
-- STORAGE BUCKETS SETUP
-- ====================================================================
-- To enable Supabase Storage for product images and branding:
-- Go to Supabase -> Storage -> Create new bucket:
-- 1. "cafe-assets" (Set Public: true)
-- 2. Add policy: Give public SELECT access, and authenticated admin INSERT/UPDATE/DELETE access.
