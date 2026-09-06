-- Adds seller self-service support to an existing database without
-- dropping any tables (schema.sql itself is destructive — DROP TABLE ... CASCADE
-- — so use this instead if you already have real data you want to keep).
--
-- Run with:
--   psql $DATABASE_URL -f db/migrate_sellers.sql

ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS owner_user_id INTEGER UNIQUE REFERENCES users(id);

ALTER TABLE sellers
  ALTER COLUMN verified SET DEFAULT FALSE;

-- role and status are already free-text VARCHAR columns with no CHECK
-- constraint, so 'seller' is usable immediately as a role value —
-- nothing to alter there.
