-- Database Schema for Beit El Anaka (بيت الأناقة) E-commerce Store

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  discount_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_wilaya TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery prices table
CREATE TABLE IF NOT EXISTS delivery_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_name TEXT NOT NULL,
  wilaya_code INTEGER NOT NULL UNIQUE,
  home_delivery NUMERIC NOT NULL,
  office_delivery NUMERIC NOT NULL
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  applies_to TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read products" ON products
  FOR SELECT USING (true);

-- Allow public read access to delivery_prices
CREATE POLICY "Allow public read delivery_prices" ON delivery_prices
  FOR SELECT USING (true);

-- Allow public read access to promotions
CREATE POLICY "Allow public read active promotions" ON promotions
  FOR SELECT USING (true);

-- Allow public read access to site_settings
CREATE POLICY "Allow public read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Allow public insert into orders
CREATE POLICY "Allow public insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow service role full access (admin operations)
CREATE POLICY "Allow service role all products" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role all orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role all delivery_prices" ON delivery_prices
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role all promotions" ON promotions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role all site_settings" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
