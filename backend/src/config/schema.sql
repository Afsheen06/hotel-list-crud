-- Hotels table: run once to set up the database.
-- Usage: psql -U postgres -d hotel_db -f src/config/schema.sql

CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_path VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Speeds up title search (ILIKE) and price range filtering
CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price);
