-- CafeCanopy Restaurant POS - Complete Database Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Snowflake ID Sequence and Generator Function
CREATE SEQUENCE IF NOT EXISTS snowflake_id_seq;

CREATE OR REPLACE FUNCTION next_snowflake_id() RETURNS bigint AS $$
DECLARE
    our_epoch bigint := 1770000000000; -- custom epoch in milliseconds (e.g. 2026)
    seq_id bigint;
    now_millis bigint;
    worker_id bigint := 1; -- default node/worker ID
    result bigint;
BEGIN
    SELECT nextval('snowflake_id_seq') % 4096 INTO seq_id;
    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint INTO now_millis;
    result := (now_millis - our_epoch) << 22;
    result := result | (worker_id << 12);
    result := result | seq_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- USERS & AUTH
-- ═══════════════════════════════════════════════════════════
CREATE TABLE users (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee', 'kitchen', 'customer')),
  active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- CUSTOMERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE customers (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_accounts (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  lifetime_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'bonus')),
  description TEXT,
  order_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- PRODUCTS & CATEGORIES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE categories (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#C8A97A',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  name VARCHAR(200) NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL,
  tax DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  unit_of_measure VARCHAR(50) DEFAULT 'piece',
  image_url TEXT,
  kitchen_enabled BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- FLOORS & TABLES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE floors (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tables (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  floor_id BIGINT NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  table_number VARCHAR(20) NOT NULL,
  seats INTEGER DEFAULT 4,
  shape VARCHAR(20) DEFAULT 'square' CHECK (shape IN ('square', 'round', 'rectangle')),
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'paid')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- PAYMENT METHODS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE payment_methods (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'card', 'upi', 'wallet')),
  upi_id VARCHAR(100),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- COUPONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE coupons (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- PROMOTIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE promotions (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  name VARCHAR(200) NOT NULL,
  promotion_type VARCHAR(20) NOT NULL CHECK (promotion_type IN ('product', 'order')),
  apply_on VARCHAR(20) CHECK (apply_on IN ('product', 'order', 'category')),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  minimum_quantity INTEGER DEFAULT 1,
  minimum_amount DECIMAL(10,2) DEFAULT 0,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- POS SESSIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE sessions (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  opened_by BIGINT NOT NULL REFERENCES users(id),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opening_amount DECIMAL(10,2) DEFAULT 0,
  closing_amount DECIMAL(10,2),
  expected_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'reconciled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE orders (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  table_id BIGINT REFERENCES tables(id) ON DELETE SET NULL,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  employee_id BIGINT NOT NULL REFERENCES users(id),
  session_id BIGINT REFERENCES sessions(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent_to_kitchen', 'preparing', 'ready', 'paid', 'cancelled', 'refunded')),
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  coupon_id BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_discount DECIMAL(10,2) DEFAULT 0,
  promotion_discount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  tax DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  kitchen_status VARCHAR(20) DEFAULT 'pending' CHECK (kitchen_status IN ('pending', 'preparing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method_id BIGINT NOT NULL REFERENCES payment_methods(id),
  amount DECIMAL(10,2) NOT NULL,
  amount_received DECIMAL(10,2),
  change_due DECIMAL(10,2) DEFAULT 0,
  transaction_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- KITCHEN DISPLAY
-- ═══════════════════════════════════════════════════════════
CREATE TABLE kitchen_tickets (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage VARCHAR(20) DEFAULT 'to_cook' CHECK (stage IN ('to_cook', 'preparing', 'completed')),
  priority INTEGER DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- SYSTEM SETTINGS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE settings (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- AUDIT LOGS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- BOOKINGS (Customer Portal)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE bookings (
  id BIGINT PRIMARY KEY DEFAULT next_snowflake_id(),
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  table_id BIGINT REFERENCES tables(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  guests INTEGER DEFAULT 2,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_kitchen_tickets_order ON kitchen_tickets(order_id);
CREATE INDEX idx_kitchen_tickets_stage ON kitchen_tickets(stage);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_loyalty_customer ON loyalty_accounts(customer_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ═══════════════════════════════════════════════════════════
-- SEED DEFAULT DATA
-- ═══════════════════════════════════════════════════════════

-- Default payment methods
INSERT INTO payment_methods (name, type, active, sort_order) VALUES
  ('Cash', 'cash', true, 1),
  ('Card', 'card', true, 2),
  ('UPI', 'upi', true, 3);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('restaurant_name', 'CafeCanopy'),
  ('restaurant_logo', ''),
  ('restaurant_address', ''),
  ('restaurant_phone', ''),
  ('gst_number', ''),
  ('currency', 'INR'),
  ('currency_symbol', '₹'),
  ('tax_rate', '5'),
  ('receipt_footer', 'Thank you for dining with us!'),
  ('loyalty_points_per_rupee', '1'),
  ('loyalty_bronze_threshold', '0'),
  ('loyalty_silver_threshold', '1000'),
  ('loyalty_gold_threshold', '5000'),
  ('loyalty_platinum_threshold', '15000');

-- Default Admin user (password: Admin@123)
INSERT INTO users (name, email, password, role, active) VALUES
  ('Admin', 'admin@cafecanopy.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFgpRLfnQJKhPRu', 'admin', true);

-- Default floor and tables
INSERT INTO floors (name, sort_order) VALUES ('Ground Floor', 1), ('First Floor', 2);

-- Default categories
INSERT INTO categories (name, color) VALUES
  ('Coffee & Tea', '#C8A97A'),
  ('Breakfast', '#E8B86D'),
  ('Sandwiches', '#D4956A'),
  ('Salads', '#8BAF6B'),
  ('Desserts', '#C97BA3'),
  ('Beverages', '#7BAFC9');
