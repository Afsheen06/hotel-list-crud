-- Sample data for demos / interview walkthroughs.
-- Uses the EXISTING hotels table (see schema.sql) — no schema changes.
-- Safe to re-run: inserts only missing demo hotels and preserves existing rows.
--
-- Usage: psql -U postgres -d hotel_db -f src/config/seed.sql
--
-- Each image_path points to a real file already placed in backend/uploads/
-- (seed-hotel-1.jpg ... seed-hotel-8.jpg), served by Express's static
-- /uploads route — same local-storage approach the app already uses for
-- images uploaded through the Add/Edit form.

WITH demo_hotels (title, description, latitude, longitude, price, image_path) AS (
	VALUES
('Marina Grand Hotel',
 'A modern business hotel near Marina Beach, with sea-facing rooms and a rooftop restaurant overlooking the city.',
 13.0827, 80.2707, 3800.00, '/uploads/seed-hotel-1.jpg'),

('Green Valley Resort',
 'A tea-estate resort in the hills with cool weather year-round, guided nature walks, and a bonfire lounge in the evenings.',
 11.4064, 76.6932, 5200.00, '/uploads/seed-hotel-2.jpg'),

('Royal Residency',
 'A comfortable mid-range hotel in a fast-growing industrial city, popular with business travelers for its central location.',
 11.0168, 76.9558, 2600.00, '/uploads/seed-hotel-3.jpg'),

('Heritage Palace',
 'A heritage property close to the historic temple district, featuring courtyard architecture and traditional South Indian dining.',
 9.9252, 78.1198, 4100.00, '/uploads/seed-hotel-4.jpg'),

('River View Inn',
 'A riverside inn with balcony rooms overlooking the water, a short walk from the old town and local markets.',
 10.7905, 78.7047, 1900.00, '/uploads/seed-hotel-5.jpg'),

('Beachside Resort',
 'A relaxed coastal resort with a private beach stretch, water sports on request, and French-colonial-inspired architecture nearby.',
 11.9416, 79.8083, 4700.00, '/uploads/seed-hotel-6.jpg'),

('City Comfort Hotel',
 'A no-frills budget hotel near the bus stand, ideal for short stays and travelers passing through the region.',
 11.6643, 78.1460, 1500.00, '/uploads/seed-hotel-7.jpg'),

('Hill View Residency',
 'A hill-station guesthouse with lake views, fireplace rooms for cold evenings, and easy access to nearby viewpoints and trails.',
 10.2381, 77.4892, 3300.00, '/uploads/seed-hotel-8.jpg')
)
INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
SELECT demo.title, demo.description, demo.latitude, demo.longitude, demo.price, demo.image_path
FROM demo_hotels AS demo
WHERE NOT EXISTS (
	SELECT 1 FROM hotels AS existing WHERE existing.title = demo.title
);
