-- =========================================================
-- PickleMart India - Complete Relational PostgreSQL Schema
-- Database schema for 28 entities with full foreign keys & indexes
-- =========================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin'
    referral_code VARCHAR(30) UNIQUE,
    referred_by VARCHAR(30),
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADMINS
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role_level VARCHAR(50) DEFAULT 'superadmin', -- 'superadmin', 'manager', 'moderator'
    permissions JSONB DEFAULT '["*"]'::jsonb,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    house_flat VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    address_type VARCHAR(20) DEFAULT 'Home', -- 'Home', 'Work', 'Other'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SELLERS / MANUFACTURERS
CREATE TABLE IF NOT EXISTS seller_information (
    id VARCHAR(64) PRIMARY KEY,
    seller_name VARCHAR(150) NOT NULL,
    brand_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    fssai_license_no VARCHAR(30) NOT NULL,
    gstin VARCHAR(30),
    registered_address TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    seller_id VARCHAR(64) REFERENCES seller_information(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    subtitle VARCHAR(255),
    description TEXT NOT NULL,
    regional_style VARCHAR(100) NOT NULL, -- 'Andhra', 'Kerala', 'Rajasthan', 'Punjab', 'Bengali', etc.
    dietary_type VARCHAR(20) DEFAULT 'veg', -- 'veg', 'non-veg'
    spice_level VARCHAR(20) DEFAULT 'medium', -- 'mild', 'medium', 'spicy', 'extra-spicy'
    oil_type VARCHAR(100) DEFAULT 'Cold-Pressed Gingelly & Mustard Oil',
    base_price NUMERIC(10, 2) NOT NULL,
    base_mrp NUMERIC(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 4.50,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRODUCT VARIANTS (Weights: 250g, 500g, 1kg, 2kg, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    weight_label VARCHAR(30) NOT NULL, -- '250g', '500g', '1kg'
    weight_in_grams INT NOT NULL,
    sku VARCHAR(60) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(64) PRIMARY KEY,
    variant_id VARCHAR(64) UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 100,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    reserved_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. FOOD COMPLIANCE & LEGAL METROLOGY INFORMATION
CREATE TABLE IF NOT EXISTS compliance_information (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    fssai_license_no VARCHAR(30) NOT NULL,
    ingredients TEXT NOT NULL,
    allergens_info TEXT,
    nutritional_info JSONB, -- { "energy": "420 kcal", "protein": "3g", "fat": "38g", "sodium": "1800mg" }
    storage_instructions TEXT NOT NULL,
    shelf_life VARCHAR(100) NOT NULL, -- e.g. '12 Months from packaging'
    country_of_origin VARCHAR(50) DEFAULT 'India',
    batch_number_format VARCHAR(50) DEFAULT 'PKL-BATCH-{YYYYMM}',
    manufacturing_details TEXT NOT NULL,
    customer_care_details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. CART
CREATE TABLE IF NOT EXISTS cart (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(64) PRIMARY KEY,
    cart_id VARCHAR(64) REFERENCES cart(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS wishlist_items (
    id VARCHAR(64) PRIMARY KEY,
    wishlist_id VARCHAR(64) REFERENCES wishlist(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wishlist_id, product_id)
);

-- 15. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    is_first_order_only BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. COUPON USAGE
CREATE TABLE IF NOT EXISTS coupon_usage (
    id VARCHAR(64) PRIMARY KEY,
    coupon_id VARCHAR(64) REFERENCES coupons(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(64),
    discount_availed NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(40) UNIQUE NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    address_id VARCHAR(64) REFERENCES addresses(id) ON DELETE SET NULL,
    shipping_address_snapshot JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    coupon_code VARCHAR(30),
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00, -- GST
    total_amount NUMERIC(10, 2) NOT NULL,
    order_status VARCHAR(40) DEFAULT 'Order Placed', 
    -- 'Order Placed', 'Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'
    payment_status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed', 'Refunded'
    payment_method VARCHAR(30) NOT NULL, -- 'UPI', 'CARD', 'NETBANKING', 'COD'
    delivery_partner VARCHAR(60),
    tracking_number VARCHAR(100),
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    variant_weight VARCHAR(30) NOT NULL,
    sku VARCHAR(60),
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    fssai_info VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    payment_gateway VARCHAR(40) DEFAULT 'SIMULATED_TEST', -- 'RAZORPAY', 'CASHFREE', 'SIMULATED_TEST'
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    payment_method VARCHAR(30) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Success', 'Failed', 'Refunded'
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(120) NOT NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    headline VARCHAR(200),
    comment TEXT NOT NULL,
    image_url TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, product_id)
);

-- 21. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) NOT NULL, -- 'order_update', 'promo', 'coupon', 'system'
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. BANNERS
CREATE TABLE IF NOT EXISTS banners (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    badge_text VARCHAR(60),
    image_url TEXT NOT NULL,
    button_text VARCHAR(50) DEFAULT 'Shop Now',
    destination_url VARCHAR(255) DEFAULT '/products',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(64) PRIMARY KEY,
    referrer_user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Qualifying_Order_Placed', 'Completed', 'Expired'
    reward_amount NUMERIC(10, 2) DEFAULT 100.00,
    qualifying_order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 24. REFUNDS
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Processed', 'Rejected'
    approved_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 25. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    ticket_number VARCHAR(40) UNIQUE NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Order Inquiry', -- 'Order Inquiry', 'Delivery Issue', 'Quality Concern', 'Refund Request', 'General'
    status VARCHAR(30) DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 26. DELIVERY SETTINGS
CREATE TABLE IF NOT EXISTS delivery_settings (
    id VARCHAR(64) PRIMARY KEY,
    standard_delivery_fee NUMERIC(10, 2) DEFAULT 50.00,
    free_delivery_threshold NUMERIC(10, 2) DEFAULT 499.00,
    cod_charge NUMERIC(10, 2) DEFAULT 25.00,
    cod_enabled BOOLEAN DEFAULT TRUE,
    estimated_transit_days INT DEFAULT 4,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 27. SERVICEABLE PINCODES
CREATE TABLE IF NOT EXISTS serviceable_pincodes (
    pincode VARCHAR(10) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    estimated_days INT DEFAULT 3,
    is_cod_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 28. TAX & GST SETTINGS
CREATE TABLE IF NOT EXISTS tax_settings (
    id VARCHAR(64) PRIMARY KEY,
    category_name VARCHAR(100) DEFAULT 'Pickles & Processed Foods',
    hsn_code VARCHAR(20) DEFAULT '20019000',
    cgst_percentage NUMERIC(4, 2) DEFAULT 2.50,
    sgst_percentage NUMERIC(4, 2) DEFAULT 2.50,
    igst_percentage NUMERIC(4, 2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_dietary ON products(dietary_type);
CREATE INDEX IF NOT EXISTS idx_products_spice ON products(spice_level);
CREATE INDEX IF NOT EXISTS idx_products_regional ON products(regional_style);
CREATE INDEX IF NOT EXISTS idx_products_active_bestseller ON products(is_active, is_bestseller);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_active ON serviceable_pincodes(is_active);
