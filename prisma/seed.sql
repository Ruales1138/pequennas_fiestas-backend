-- Seed usuarios principales
INSERT INTO users (id, name, email, password, role, "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Administrador GigaShow', 'admin@gigashow.com', '$2b$10$Zuxyz4eObd1MJFqmOLONlunHP3.dsI/x1DncbAE.dkw5Zujy0rMhm', 'admin', true, true, now(), now()),
  (gen_random_uuid(), 'Usuario Estándar GigaShow', 'user@gigashow.com', '$2b$10$PCwH3G32g0tfY6xL4tTRBOCX/ukWSeZ3.UL0hmx/iIyAcFLE/Lqui', 'user', true, true, now(), now()),
  (gen_random_uuid(), 'Cliente Demo GigaShow', 'cliente@gigashow.com', '$2b$10$Jp.ac20uG0JFilENzC/DFuucISFjZoWXz49v/suYWi21fuvIwIxr2', 'cliente', true, true, now(), now()),
  (gen_random_uuid(), 'Banda Fiesta Show', 'artista@gigashow.com', '$2b$10$1tRpOFjzStOG7CzKpKa95.VQWMoljgZ3j1xHQmEllsTpH53roP73q', 'artista', true, true, now(), now())
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "emailVerified" = true,
  "isActive" = true,
  "updatedAt" = now();

-- Perfil del artista principal
INSERT INTO artist_profiles (id, "userId", bio, "contactPhone", "contactSocial", "baseRate", city, "coverageArea", category, "imageUrl", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  id,
  'Agrupación musical y animación en vivo para fiestas y eventos corporativos.',
  '+57 300 123 4567',
  '@bandafiestashow',
  350000,
  'Medellín',
  'Valle de Aburrá y Oriente Antioqueño',
  'Música',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  true,
  now(),
  now()
FROM users WHERE email = 'artista@gigashow.com'
ON CONFLICT ("userId") DO UPDATE SET
  bio = EXCLUDED.bio,
  "isActive" = true,
  "updatedAt" = now();

