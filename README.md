# GigaShow - Backend

API del proyecto GigaShow construida con Node.js, Express y PostgreSQL
mediante Drizzle ORM. La conexión funciona tanto con PostgreSQL local como
con Neon usando `DATABASE_URL`.

## Tecnologías

- Node.js 22
- Express 5
- PostgreSQL compatible con Neon
- Drizzle ORM
- Swagger/OpenAPI 3.0

## Variables de entorno

Crea un archivo `.env` en este directorio basándote en `.env.example`:

```env
DATABASE_URL=postgresql://usuario:contraseña@host/base_de_datos
JWT_SECRET=change-this-jwt-secret-in-production
JWT_EXPIRES_IN=24h
PORT=3000
FRONTEND_ORIGIN=http://localhost:3001
BACKEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
SUPABASE_BUCKET=artists
```

`DATABASE_URL` y `JWT_SECRET` son obligatorias.

## Seed de Base de Datos y Credenciales de Prueba

Para poblar la base de datos con los usuarios predeterminados (contraseñas hasheadas con `bcrypt`):

```bash
npx prisma db seed
# o mediante script npm:
npm run seed
```

### Credenciales de Prueba (Entorno de Desarrollo / Evaluación)

| Rol | Correo electrónico | Contraseña de prueba |
| --- | --- | --- |
| **Administrador (`admin`)** | `admin@gigashow.com` | `Admin123!` |
| **Usuario estándar (`user`)** | `user@gigashow.com` | `User123!` |
| **Cliente (`cliente`)** | `cliente@gigashow.com` | `Cliente123!` |
| **Artista (`artista`)** | `artista@gigashow.com` | `Artista123!` |

> **Nota de seguridad:** El rol `admin` se aprovisiona exclusivamente por medio del seed de base de datos; el endpoint público de registro y los flujos de onboarding bloquean explícitamente la auto-asignación del rol `admin`.

## Ejecución local

```bash
npm ci
npm start
```

La API estará disponible en `http://localhost:3000`.

Endpoints de verificación:

- `GET /health`
- `GET /health/db`
- `GET /api/db/tables`

La documentación interactiva de Swagger está disponible en
`http://localhost:3000/api-docs` y el documento OpenAPI en
`http://localhost:3000/openapi.json`.

## Ejecución con Docker

```bash
docker build -t gigashow-backend .
docker run --rm -p 3000:3000 `
  -e DATABASE_URL="postgresql://usuario:contraseña@host/base_de_datos" `
  -e FRONTEND_ORIGIN="http://localhost:5173" `
  gigashow-backend
```

El contenedor necesita acceso a una base de datos PostgreSQL válida mediante
`DATABASE_URL`.
