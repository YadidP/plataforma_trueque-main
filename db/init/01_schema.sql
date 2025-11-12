-- db/init/01_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums lógicos como CHECKs para evitar conflictos con TypeORM
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario','emprendedor','ong','admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS entrepreneur_profiles (
   id SERIAL PRIMARY KEY,
   user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
   business_name VARCHAR(200) NOT NULL,
   validation_status VARCHAR(20) DEFAULT 'pendiente' CHECK (validation_status IN ('pendiente','validado','rechazado')),
   tax_id VARCHAR(50),
   phone VARCHAR(30),
   description TEXT,
   created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS materials (
 id SERIAL PRIMARY KEY,
 name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS subcategories (
 id SERIAL PRIMARY KEY,
 category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
 name VARCHAR(100) NOT NULL,
 UNIQUE(category_id, name)
);

CREATE TABLE IF NOT EXISTS subcategory_materials (
 id SERIAL PRIMARY KEY,
 subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
 material_id INTEGER REFERENCES materials(id),
 UNIQUE(subcategory_id, material_id)
);

CREATE TABLE IF NOT EXISTS impact_metrics (
 id SERIAL PRIMARY KEY,
 code VARCHAR(20) UNIQUE NOT NULL,
 name VARCHAR(100) NOT NULL,
 unit VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS impact_equivalences (
 id SERIAL PRIMARY KEY,
 material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
 metric_id INTEGER REFERENCES impact_metrics(id) ON DELETE CASCADE,
 base_quantity NUMERIC NOT NULL,
 base_unit VARCHAR(50),
 impact_value NUMERIC NOT NULL,
 source_reference TEXT,
 UNIQUE(material_id, metric_id, base_unit)
);

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category_id INT NOT NULL REFERENCES categories(id),
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
  material_id INTEGER NOT NULL REFERENCES materials(id),
  quantity NUMERIC(10,2) NOT NULL,
  unit_credits NUMERIC(10,2) NOT NULL,
  unit_label VARCHAR(50) NOT NULL,
  image_url VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (status IN ('activa','intercambiada','pausada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listings_author_id ON listings(author_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory_id ON listings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_listings_material_id ON listings(material_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

CREATE TABLE IF NOT EXISTS exchanges (
  id BIGSERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id),
  buyer_id INT NOT NULL REFERENCES users(id),
  seller_id INT NOT NULL REFERENCES users(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  credits_per_unit NUMERIC(10,2) NOT NULL,
  credits_total NUMERIC(10,2) NOT NULL,
  exchange_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exchanges_listing_id ON exchanges(listing_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_buyer_id ON exchanges(buyer_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_seller_id ON exchanges(seller_id);

CREATE TABLE IF NOT EXISTS credit_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  credits INT NOT NULL CHECK (credits > 0),
  amount_bs NUMERIC(10,2) NOT NULL CHECK (amount_bs >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pagado' CHECK (status IN ('pendiente','pagado','fallido')),
  payment_ref VARCHAR(100),
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);

CREATE TABLE IF NOT EXISTS credits_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  operation_type VARCHAR(100) NOT NULL,
  delta NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  related_id BIGINT,
  log_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credits_log_user_id ON credits_log(user_id);

CREATE TABLE IF NOT EXISTS exchange_log (
  id BIGSERIAL PRIMARY KEY,
  exchange_id BIGINT NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  details TEXT NOT NULL,
  log_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_exchange_log_exchange_id ON exchange_log(exchange_id);

CREATE TABLE IF NOT EXISTS impact_daily (
  id BIGSERIAL PRIMARY KEY,
  impact_date DATE NOT NULL UNIQUE,
  reused_items INT NOT NULL DEFAULT 0,
  co2_saved_kg NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  service_hours NUMERIC(10,2) NOT NULL DEFAULT 0.00
);