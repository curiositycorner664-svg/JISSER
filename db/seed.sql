-- Raw reference seed data (for inspection only — password hash below is a
-- placeholder). Run `npm run seed` instead to populate real data with
-- correct bcrypt hashes, the full seller roster, and the full catalog.

INSERT INTO sellers (name, location, rating, review_count, since_year) VALUES
('Atlas Textile Supply', 'Charlotte, NC', 4.7, 1284, 2014),
('Northbridge Housewares', 'Grand Rapids, MI', 4.5, 862, 2017);

INSERT INTO users (company_name, contact_name, email, password_hash, role, payment_terms, credit_limit, status)
VALUES ('Admin Co', 'Admin User', 'admin@example.com', '$2a$10$replace_with_real_hash', 'admin', 'prepaid', 0, 'approved');

INSERT INTO products (seller_id, sku, name, description, category, base_price, moq, stock_quantity) VALUES
(1, 'WR-1001', 'Cotton T-Shirt (Blank)', 'Plain 100% cotton t-shirt, bulk pack, various sizes.', 'Apparel', 4.50, 50, 5000),
(2, 'WR-2001', 'Ceramic Coffee Mug 11oz', 'Standard white ceramic mug, sublimation-ready.', 'Housewares', 2.10, 100, 8000);

INSERT INTO pricing_tiers (product_id, min_quantity, unit_price) VALUES
(1, 50, 4.50), (1, 200, 4.10), (1, 500, 3.75),
(2, 100, 2.10), (2, 400, 1.93), (2, 1000, 1.72);
