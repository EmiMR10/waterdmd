CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  tag TEXT NOT NULL,
  description TEXT NOT NULL,
  details TEXT NOT NULL,
  host_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  accent TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  max_guests INTEGER NOT NULL CHECK (max_guests > 0),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_properties (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  nights INTEGER NOT NULL CHECK (nights > 0),
  nightly_rate_cents INTEGER NOT NULL CHECK (nightly_rate_cents > 0),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  service_fee_cents INTEGER NOT NULL CHECK (service_fee_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS bookings_property_dates_idx ON bookings (property_id, check_in, check_out);

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlaps;
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlaps
  EXCLUDE USING gist (
    property_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status = 'confirmed');

INSERT INTO properties (slug, title, location, region, tag, description, details, host_name, image_url, accent, price_cents, max_guests)
VALUES
  ('casa-brisa', 'Casa Brisa', 'Sayulita, Nayarit, México', 'Costa del Pacífico', 'Escapada lenta', 'Una cabaña silenciosa entre pinos, con café al sol y el mar a pocos minutos.', '2 huéspedes · 1 cama · 1 baño', 'Mariana', '/media/mini-airbnb-cabin.jpg', 'pino', 14200, 2),
  ('luz-de-barrio', 'Luz de Barrio', 'Ciudad de México, México', 'Barrio histórico', 'Para trabajar', 'Un loft sencillo y luminoso para vivir la ciudad a pie, entre cafés y galerías de barrio.', '2 huéspedes · 1 cama · 1 baño', 'Lucía', '/media/mini-airbnb-loft.jpg', 'terracota', 11800, 2),
  ('casa-limon', 'Casa Limón', 'Todos Santos, Baja California Sur, México', 'Pueblo costero', 'Junto al mar', 'Una terraza blanca, un árbol de limón y tardes largas mirando cómo cambia el agua.', '4 huéspedes · 2 camas · 2 baños', 'Diego', '/media/mini-airbnb-villa.jpg', 'limón', 18400, 4),
  ('patio-de-sal', 'Patio de Sal', 'Oaxaca, Oaxaca, México', 'Barrio de Jalatlaco', 'Pista local', 'Un patio fresco para desayunar despacio y encontrar pequeños talleres a la vuelta.', '2 huéspedes · 1 cama · 1 baño', 'Ana', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', 'sal', 9600, 2),
  ('nido-de-piedra', 'Nido de Piedra', 'Valle de Bravo, Estado de México, México', 'Bosque y lago', 'Naturaleza', 'Una casa de piedra para bajar el ritmo, leer junto a la chimenea y caminar sin prisa.', '3 huéspedes · 2 camas · 1 baño', 'Sofía', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=85', 'piedra', 15500, 3)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, location = EXCLUDED.location, region = EXCLUDED.region,
  tag = EXCLUDED.tag, description = EXCLUDED.description, details = EXCLUDED.details,
  host_name = EXCLUDED.host_name, image_url = EXCLUDED.image_url, accent = EXCLUDED.accent,
  price_cents = EXCLUDED.price_cents, max_guests = EXCLUDED.max_guests;
