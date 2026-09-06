-- Wholesale B2B E-commerce Schema (PostgreSQL)

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- B2B accounts (wholesale buyers)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'buyer', -- 'buyer' or 'admin'
  payment_terms VARCHAR(20) NOT NULL DEFAULT 'net_30', -- prepaid, net_15, net_30, net_60
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit_used NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, suspended
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Marketplace sellers (third-party suppliers whose wares are listed on the site)
CREATE TABLE sellers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(100),
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  review_count INTEGER NOT NULL DEFAULT 0,
  since_year INTEGER,
  verified BOOLEAN NOT NULL DEFAULT TRUE
);

-- Products (wares)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES sellers(id),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  name_fr VARCHAR(200),
  name_ar VARCHAR(200),
  description_fr TEXT,
  description_ar TEXT,
  category VARCHAR(100),
  base_price NUMERIC(12,2) NOT NULL, -- price per unit at lowest quantity tier
  moq INTEGER NOT NULL DEFAULT 1,     -- minimum order quantity
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bulk / tiered pricing per product: "buy N+ units, pay $X each"
CREATE TABLE pricing_tiers (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  UNIQUE(product_id, min_quantity)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, paid, cancelled
  payment_terms VARCHAR(20) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_pricing_tiers_product ON pricing_tiers(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_seller ON products(seller_id);
