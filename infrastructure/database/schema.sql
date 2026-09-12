-- ============================================================================
-- ShopSense AI Commerce OS — PostgreSQL + pgvector Master Schema
-- Target Architecture: High-Throughput Online Transactional, Search & RecSys Store
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ----------------------------------------------------------------------------
-- 1. USERS & RBAC ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'pharmacy_operator', 'delivery_partner', 'ml_analyst', 'admin')),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    persona_cluster VARCHAR(64) DEFAULT 'Balanced Explorer',
    target_budget_inr NUMERIC(12, 2) DEFAULT 50000.00,
    preferred_categories TEXT[] DEFAULT '{}',
    preferred_brands TEXT[] DEFAULT '{}',
    category_affinities JSONB DEFAULT '{}',
    embedding vector(1536),
    embedding_8d vector(8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_persona ON users(persona_cluster);

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS & MULTI-DOMAIN VECTOR STORE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    brand VARCHAR(128) NOT NULL,
    category VARCHAR(128) NOT NULL,
    sub_category VARCHAR(128),
    domain VARCHAR(32) NOT NULL DEFAULT 'flagship' CHECK (domain IN ('flagship', 'grocery', 'pharmacy', 'bazaar', 'marketplace')),
    price_inr NUMERIC(12, 2) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    original_price_inr NUMERIC(12, 2),
    original_price_usd NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 4.50 CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_count INTEGER DEFAULT 10,
    image_url TEXT,
    badge VARCHAR(64),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    specs JSONB DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    popularity_score NUMERIC(5, 4) DEFAULT 0.5000,
    historical_ctr NUMERIC(5, 4) DEFAULT 0.0500,
    release_days_ago INTEGER DEFAULT 0,
    shipping_speed VARCHAR(64) DEFAULT 'Standard Delivery',
    embedding vector(1536),
    embedding_8d vector(8),
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'discontinued', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_domain ON products(domain);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_inr);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- HNSW Vector Index for 8-Dimensional Semantic Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_products_embedding_8d_hnsw 
ON products USING hnsw (embedding_8d vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- HNSW Vector Index for High-Dimensional 1536-D Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_products_embedding_hnsw 
ON products USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ----------------------------------------------------------------------------
-- 3. QUICK COMMERCE & LOCATION-AWARE DARK STORES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dark_stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    locality VARCHAR(128) NOT NULL,
    city VARCHAR(64) NOT NULL DEFAULT 'Bengaluru',
    pincode VARCHAR(10) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    delivery_sla_minutes INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    rider_count INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dark_store_inventory (
    id VARCHAR(64) PRIMARY KEY,
    dark_store_id VARCHAR(64) NOT NULL REFERENCES dark_stores(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    aisle_bay VARCHAR(32),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_darkstore_product UNIQUE (dark_store_id, product_id)
);

CREATE TABLE IF NOT EXISTS inventory_reservations (
    id VARCHAR(64) PRIMARY KEY,
    dark_store_id VARCHAR(64) NOT NULL REFERENCES dark_stores(id),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'COMMITTED', 'RELEASED', 'EXPIRED')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON inventory_reservations(status, expires_at);

-- ----------------------------------------------------------------------------
-- 4. HEALTHCARE & PRESCRIPTION VERIFICATION (PHARMACY)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicines_metadata (
    id VARCHAR(64) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    salt_composition VARCHAR(255) NOT NULL,
    requires_prescription BOOLEAN DEFAULT FALSE,
    schedule VARCHAR(16) DEFAULT 'None' CHECK (schedule IN ('None', 'Schedule H', 'Schedule H1', 'Schedule X')),
    therapeutic_class VARCHAR(128),
    generic_substitute_ids TEXT[] DEFAULT '{}',
    unit_dosage VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER,
    doctor_name VARCHAR(255),
    doctor_registration VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED', 'OCR_EXTRACTED', 'PHARMACIST_ASSIGNED', 'VERIFIED', 'REJECTED', 'APPROVED_FOR_DISPATCH')),
    document_url TEXT NOT NULL,
    extracted_salts TEXT[] DEFAULT '{}',
    allocated_pharmacist_id VARCHAR(64) REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescription_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    prescription_id VARCHAR(64) NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    pharmacist_id VARCHAR(64) NOT NULL REFERENCES users(id),
    pharmacist_reg_number VARCHAR(64) NOT NULL,
    decision VARCHAR(32) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. MARKETPLACE (P2P / C2C) & FRAUD RISK SCORING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seller_trust_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    account_age_days INTEGER NOT NULL DEFAULT 30,
    successful_sales_count INTEGER NOT NULL DEFAULT 0,
    cancelled_orders_count INTEGER NOT NULL DEFAULT 0,
    average_buyer_rating NUMERIC(3, 2) DEFAULT 5.00,
    is_phone_verified BOOLEAN DEFAULT TRUE,
    is_gov_id_verified BOOLEAN DEFAULT FALSE,
    trust_score NUMERIC(5, 2) DEFAULT 75.00 CHECK (trust_score >= 0.0 AND trust_score <= 100.0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    condition VARCHAR(32) NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Good', 'Fair')),
    asking_price_inr NUMERIC(12, 2) NOT NULL,
    estimated_retail_inr NUMERIC(12, 2) NOT NULL,
    price_drop_pct NUMERIC(5, 2) DEFAULT 0.00,
    location_city VARCHAR(128) NOT NULL,
    location_pincode VARCHAR(10) NOT NULL,
    images TEXT[] DEFAULT '{}',
    trust_score NUMERIC(5, 2) DEFAULT 75.00,
    moderation_status VARCHAR(32) NOT NULL DEFAULT 'ALLOW' CHECK (moderation_status IN ('ALLOW', 'MANUAL_REVIEW', 'BLOCK')),
    moderation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_city ON marketplace_listings(location_city);

-- ----------------------------------------------------------------------------
-- 6. MULTI-SELLER BUY BOX (B2C) & DYNAMIC REPRICER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    rating NUMERIC(4, 3) NOT NULL DEFAULT 0.950,
    fulfillment_type VARCHAR(64) NOT NULL CHECK (fulfillment_type IN ('Fulfillment by ShopSense', 'Merchant Fulfilled')),
    fulfillment_days INTEGER NOT NULL DEFAULT 2,
    cancellation_rate NUMERIC(4, 3) NOT NULL DEFAULT 0.005,
    on_time_delivery_rate NUMERIC(4, 3) NOT NULL DEFAULT 0.990,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchant_listings (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    price_inr NUMERIC(12, 2) NOT NULL,
    shipping_fee_inr NUMERIC(8, 2) DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 20,
    min_margin_floor_inr NUMERIC(12, 2) NOT NULL,
    is_prime_eligible BOOLEAN DEFAULT TRUE,
    buy_box_score NUMERIC(5, 4) DEFAULT 0.0000,
    is_buy_box_winner BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_merchant_product UNIQUE (merchant_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_prod ON merchant_listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_winner ON merchant_listings(product_id, is_buy_box_winner);

-- ----------------------------------------------------------------------------
-- 7. IDEMPOTENT PAYMENT ORCHESTRATION & FINTECH LEDGER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(128) PRIMARY KEY,
    request_hash VARCHAR(128) NOT NULL,
    response_body JSONB NOT NULL,
    http_status INTEGER NOT NULL DEFAULT 200,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expiry ON idempotency_keys(expires_at);

CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    amount_inr NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    method VARCHAR(32) NOT NULL CHECK (method IN ('upi', 'wallet', 'bank_transfer', 'card', 'cod')),
    status VARCHAR(32) NOT NULL DEFAULT 'requires_action' CHECK (status IN ('requires_action', 'processing', 'succeeded', 'failed', 'cancelled')),
    client_secret VARCHAR(128) NOT NULL,
    idempotency_key VARCHAR(128),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(64) PRIMARY KEY,
    intent_id VARCHAR(64) NOT NULL REFERENCES payment_intents(id),
    order_id VARCHAR(64) NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    method VARCHAR(32) NOT NULL,
    rrn_reference VARCHAR(64) NOT NULL,
    gateway_reference VARCHAR(64),
    status VARCHAR(32) NOT NULL CHECK (status IN ('success', 'failure', 'refunded')),
    signature VARCHAR(256),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Double-Entry Wallet Ledger
CREATE TABLE IF NOT EXISTS wallet_accounts (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_inr >= 0.00),
    cashback_earned_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    entry_type VARCHAR(32) NOT NULL CHECK (entry_type IN ('TOP_UP', 'PAYMENT_DEBIT', 'REFUND_CREDIT', 'CASHBACK_REWARD', 'PEER_TRANSFER')),
    direction VARCHAR(16) NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    amount_inr NUMERIC(12, 2) NOT NULL,
    balance_after_inr NUMERIC(12, 2) NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON wallet_ledger_entries(user_id, created_at);

-- ----------------------------------------------------------------------------
-- 8. UNIFIED COMMERCE CORE (CARTS & ORDERS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    session_id VARCHAR(128),
    total_inr NUMERIC(12, 2) DEFAULT 0.00,
    discount_inr NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(64) PRIMARY KEY,
    cart_id VARCHAR(64) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    domain VARCHAR(32) NOT NULL DEFAULT 'flagship',
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_inr NUMERIC(12, 2) NOT NULL,
    selected_dark_store_id VARCHAR(64) REFERENCES dark_stores(id),
    prescription_id VARCHAR(64) REFERENCES prescriptions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'processing', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
    domain VARCHAR(32) NOT NULL DEFAULT 'flagship',
    total_inr NUMERIC(12, 2) NOT NULL,
    total_usd NUMERIC(10, 2) NOT NULL,
    discount_inr NUMERIC(12, 2) DEFAULT 0.00,
    wallet_used_inr NUMERIC(12, 2) DEFAULT 0.00,
    tracking_number VARCHAR(128),
    carrier VARCHAR(64) DEFAULT 'ShopSense FastTrack',
    delivery_pincode VARCHAR(10) NOT NULL,
    estimated_delivery_at TIMESTAMP WITH TIME ZONE,
    prescription_id VARCHAR(64) REFERENCES prescriptions(id),
    dark_store_id VARCHAR(64) REFERENCES dark_stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    merchant_id VARCHAR(64) REFERENCES merchants(id),
    domain VARCHAR(32) NOT NULL DEFAULT 'flagship',
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_inr NUMERIC(12, 2) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 9. PARTITIONED EVENT TELEMETRY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_events (
    event_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    product_id VARCHAR(64),
    recommendation_id VARCHAR(64),
    position INTEGER,
    model_version VARCHAR(64) NOT NULL,
    experiment_id VARCHAR(64),
    variant VARCHAR(16),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS user_events_2026_09 PARTITION OF user_events
    FOR VALUES FROM ('2026-09-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

CREATE INDEX IF NOT EXISTS idx_events_user ON user_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_prod ON user_events(product_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_model ON user_events(model_version, event_type);

-- ----------------------------------------------------------------------------
-- 10. MODEL REGISTRY & OFFLINE EVALUATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_registry (
    model_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(64) UNIQUE NOT NULL,
    architecture VARCHAR(255) NOT NULL,
    stage VARCHAR(32) NOT NULL DEFAULT 'staging' CHECK (stage IN ('training', 'staging', 'production', 'archived')),
    traffic_pct INTEGER DEFAULT 0 CHECK (traffic_pct >= 0 AND traffic_pct <= 100),
    ndcg_at_5 NUMERIC(5, 4),
    ndcg_at_10 NUMERIC(5, 4),
    mrr NUMERIC(5, 4),
    auc_roc NUMERIC(5, 4),
    ctr_pct NUMERIC(5, 2),
    p95_latency_ms INTEGER,
    trained_on_events INTEGER DEFAULT 0,
    hyperparameters JSONB DEFAULT '{}',
    promoted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. A/B TESTING EXPERIMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'running' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
    variant_a_model VARCHAR(64) REFERENCES model_registry(version),
    variant_b_model VARCHAR(64) REFERENCES model_registry(version),
    traffic_split_pct INTEGER DEFAULT 50 CHECK (traffic_split_pct >= 1 AND traffic_split_pct <= 99),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    concluded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS experiment_assignments (
    experiment_id VARCHAR(64) NOT NULL REFERENCES experiments(id),
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    variant VARCHAR(16) NOT NULL CHECK (variant IN ('A', 'B')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (experiment_id, user_id)
);
