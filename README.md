# GigaShow (Pequeñas Fiestas) — Backend API

API RESTful del proyecto **GigaShow**, construida con **Node.js 22**, **Express 5**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, **JWT + Bcrypt** y **Supabase Storage** bajo principios de **Arquitectura Limpia** (`domain`, `application`, `infrastructure`, `interface`).

---

## 1. Tecnologías y Arquitectura

- **Runtime y Lenguaje:** Node.js 22 + TypeScript (`strict: true`)
- **Framework Web:** Express 5 + CORS + Multer
- **ORM y Base de Datos:** Prisma ORM 5 + PostgreSQL (compatible con Render PostgreSQL, Supabase y Neon)
- **Seguridad y Autenticación:** JWT (`jsonwebtoken`) + `bcrypt` (10 rondas de salting) + Middlewares `requireAuth` y `requireRole`
- **Almacenamiento de Archivos:** Supabase Storage / S3 (`POST /api/upload/image`)
- **Documentación API:** Swagger / OpenAPI 3.0 (`/api-docs` y `/openapi.json`)

### Estructura de Capas (Clean Architecture)
```
src/
├── domain/          # Modelos de dominio e interfaces de repositorios
├── application/     # Casos de uso del negocio (Auth, Artists, Bookings, Ratings, Upload)
├── infrastructure/  # Repositorios Prisma, DTOs (Zod), servicios JWT/Bcrypt y Supabase Storage
├── interface/       # Controladores, routers Express y middlewares (requireAuth, requireRole, error)
└── config/          # Configuración OpenAPI y variables de entorno
```

---

## 2. Reparto de Responsabilidades del Equipo

| Integrante | Rol / Módulo | Responsabilidades Principales |
| --- | --- | --- |
| **Pinilla** | Backend Core, Prisma & Storage | Migración a TypeScript, arquitectura limpia de 4 capas, esquema y migraciones en Prisma ORM, CRUD de entidades (`artists`, `bookings`, `ratings`) con paginación/filtros/borrado lógico, e integración con Supabase Storage. |
| **Ruales** | Frontend Next.js & UX | Migración a Next.js (App Router) con TypeScript, vistas principales, catálogo con filtros dinámicos, detalle de artista, formulario de reservas, cliente HTTP centralizado y diseño responsivo. |
| **Tomás Buriticá (Buri)** | Seguridad, Auth JWT, Roles, Admin & QA | Autenticación JWT (`/api/auth/register`, `/api/auth/login`), hashing `bcrypt`, script de seed y roles (`admin` / `user`), middlewares `requireAuth` y `requireRole`, endpoints y panel administrativo (`/api/admin/*`), pruebas unitarias/E2E y despliegue en Render/Vercel. |

---

## 3. Variables de Entorno

Crea un archivo `.env` en `backend/` basándote en `.env.example` (nunca versiones `.env` en Git):

```env
DATABASE_URL="postgresql://usuario:password@host:5432/gigashow?schema=public"
JWT_SECRET="reemplazar-por-secreto-seguro-en-produccion"
JWT_EXPIRES_IN="24h"
PORT=3000
FRONTEND_ORIGIN="http://localhost:3001,http://localhost:5173"
BACKEND_URL="http://localhost:3000"
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_KEY="tu-service-role-o-anon-key"
SUPABASE_BUCKET="artists"
```

---

## 4. Instalación, Migraciones y Seed

```bash
npm install
npx prisma migrate deploy
npm run seed
```

### Credenciales de Prueba (Creadas por `prisma/seed.ts`)

| Rol | Correo electrónico | Contraseña de prueba | Permisos |
| --- | --- | --- | --- |
| **Administrador (`admin`)** | `admin@gigashow.com` | `Admin123!` | Acceso total al panel `/admin` y endpoints `/api/admin/*` |
| **Usuario estándar (`user`)** | `user@gigashow.com` | `User123!` | Exploración de catálogo, reservas y calificaciones (`403` en `/admin`) |
| **Cliente (`cliente`)** | `cliente@gigashow.com` | `Cliente123!` | Creación de reservas y calificaciones (`403` en `/admin`) |
| **Artista (`artista`)** | `artista@gigashow.com` | `Artista123!` | Gestión de su perfil artístico y reservas en `/dashboard` |

> **Nota de seguridad:** El rol `admin` no puede ser elegido desde el registro público (`POST /api/auth/register`) ni desde onboarding (`POST /api/onboarding/artist-profile`). Solo se aprovisiona mediante el seed de base de datos.

---

## 5. Ejecución y Pruebas

```bash
# Modo desarrollo
npm run dev

# Compilar TypeScript + Generar cliente Prisma
npm run build

# Iniciar en producción
npm start

# Ejecutar suite de pruebas unitarias
npm test
```

### Endpoints Principales
- **Salud:** `GET /health`, `GET /health/db`
- **Autenticación:** `POST /api/auth/register`, `POST /api/auth/login`
- **Catálogo y Artistas:** `GET /api/artists`, `GET /api/artists/:id`, `POST /api/artists`, `PUT /api/artists/:id`, `DELETE /api/artists/:id`
- **Reservas:** `GET /api/bookings`, `GET /api/bookings/artist`, `POST /api/bookings`, `PATCH /api/bookings/:id/status`, `DELETE /api/bookings/:id`
- **Calificaciones:** `GET /api/ratings`, `POST /api/artists/:id/ratings`, `POST /api/ratings`, `DELETE /api/ratings/:id`
- **Subida de Imágenes:** `POST /api/upload/image` (`multipart/form-data`, campo `image`)
- **Administración (`admin`):**
  - `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `DELETE /api/admin/users/:id`
  - `GET /api/admin/artists`, `PATCH /api/admin/artists/:id/status`, `DELETE /api/admin/artists/:id`
  - `GET /api/admin/bookings`, `PATCH /api/admin/bookings/:id/status`, `DELETE /api/admin/bookings/:id`
  - `GET /api/admin/ratings`, `PATCH /api/admin/ratings/:id/status`, `DELETE /api/admin/ratings/:id`

---

## 6. Despliegue en Producción (Render)

1. Crear un servicio **Web Service** en [Render](https://render.com) conectado al repositorio `Ruales1138/pequennas_fiestas-backend`.
2. Configurar los comandos del servicio:
   - **Build Command:** `npm install --include=dev && npm run build && npm run db:deploy`
   - **Start Command:** `npm start`
3. Configurar las variables de entorno en Render (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN` apuntando al dominio de Vercel, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_BUCKET`).
4. Verificar estado en `https://<tu-servicio>.onrender.com/health` y `/api-docs`.
