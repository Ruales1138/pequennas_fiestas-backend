CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  role text NOT NULL DEFAULT 'cliente',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY,
  expires_at timestamp NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL,
  ip_address text,
  user_agent text,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp,
  refresh_token_expires_at timestamp,
  scope text,
  password text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS artist_profiles (
  id uuid PRIMARY KEY,
  user_id text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  bio text,
  contact_phone text,
  contact_social text,
  base_rate numeric(10, 2),
  city text,
  converage_area text,
  category text
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY,
  client_id text NOT NULL REFERENCES "user"(id),
  artist_id text NOT NULL REFERENCES "user"(id),
  event_date timestamp NOT NULL,
  event_location text NOT NULL,
  description text,
  job_hours numeric(5, 2),
  agreed_price numeric(10, 2),
  status text NOT NULL DEFAULT 'pendiente',
  create_at timestamp NOT NULL DEFAULT now(),
  update_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artist_ratings (
  id uuid PRIMARY KEY,
  artist_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  client_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  rating numeric(3, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT artist_ratings_artist_client_unique UNIQUE (artist_id, client_id)
);
