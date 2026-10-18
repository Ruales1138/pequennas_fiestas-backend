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

Crea un archivo `.env` en este directorio:

```env
DATABASE_URL=postgresql://usuario:contraseña@host/base_de_datos
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

`DATABASE_URL` es obligatoria. El backend verifica la conexión antes de
iniciar el servidor.

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
