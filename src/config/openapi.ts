export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Pequeñas Fiestas API",
    version: "1.0.0",
    description: "API para artistas, clientes y reservas de Pequeñas Fiestas.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Health", description: "Estado del backend y la base de datos" },
    { name: "Auth", description: "Autenticación JWT y gestión de sesión" },
    { name: "Artists", description: "Catálogo de artistas" },
    { name: "Bookings", description: "Gestión de reservas" },
    { name: "Ratings", description: "Calificaciones de artistas" },
    { name: "Upload", description: "Subida de imágenes" },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar nuevo usuario con contraseña encriptada (bcrypt) y retornar JWT",
        responses: {
          201: { description: "Usuario registrado exitosamente" },
          400: { description: "Datos inválidos o rol no permitido" },
          409: { description: "El correo electrónico ya está registrado" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión y obtener token JWT",
        responses: {
          200: { description: "Inicio de sesión exitoso" },
          401: { description: "Credenciales inválidas" },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verificar que el backend está disponible",
        responses: {
          200: {
            description: "Backend disponible",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/health/db": {
      get: {
        tags: ["Health"],
        summary: "Verificar conexión a la base de datos PostgreSQL con Prisma",
        responses: {
          200: { description: "Base de datos disponible" },
          500: { description: "Fallo de conexión" },
        },
      },
    },
    "/api/db/tables": {
      get: {
        tags: ["Health"],
        summary: "Listar tablas de la base de datos",
        responses: {
          200: { description: "Tablas encontradas" },
          500: { description: "Error consultando la base de datos" },
        },
      },
    },
    "/api/artists": {
      get: {
        tags: ["Artists"],
        summary: "Listado paginado de artistas con filtros",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
        ],
        responses: {
          200: { description: "Lista paginada de artistas" },
        },
      },
      post: {
        tags: ["Artists"],
        summary: "Crear un nuevo perfil de artista",
        responses: {
          201: { description: "Artista creado exitosamente" },
        },
      },
    },
    "/api/artists/{id}": {
      get: {
        tags: ["Artists"],
        summary: "Obtener perfil de artista por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Datos del artista" },
          404: { description: "Artista no encontrado" },
        },
      },
      put: {
        tags: ["Artists"],
        summary: "Actualizar perfil de artista",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Artista actualizado" },
          404: { description: "Artista no encontrado" },
        },
      },
      delete: {
        tags: ["Artists"],
        summary: "Borrado lógico de perfil de artista",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Artista desactivado exitosamente" },
          404: { description: "Artista no encontrado" },
        },
      },
    },
    "/api/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "Listado paginado de reservas con filtros",
        responses: {
          200: { description: "Lista paginada de reservas" },
        },
      },
      post: {
        tags: ["Bookings"],
        summary: "Crear una nueva reserva",
        responses: {
          201: { description: "Reserva creada exitosamente" },
        },
      },
    },
    "/api/bookings/{id}": {
      get: {
        tags: ["Bookings"],
        summary: "Obtener detalle de reserva",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Detalle de la reserva" },
          404: { description: "Reserva no encontrada" },
        },
      },
      put: {
        tags: ["Bookings"],
        summary: "Actualizar reserva",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Reserva actualizada" },
          404: { description: "Reserva no encontrada" },
        },
      },
      delete: {
        tags: ["Bookings"],
        summary: "Borrado lógico de reserva",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Reserva cancelada" },
          404: { description: "Reserva no encontrada" },
        },
      },
    },
    "/api/ratings": {
      get: {
        tags: ["Ratings"],
        summary: "Listado paginado de calificaciones",
        responses: {
          200: { description: "Listado paginado de calificaciones" },
        },
      },
      post: {
        tags: ["Ratings"],
        summary: "Crear calificación",
        responses: {
          201: { description: "Calificación creada" },
        },
      },
    },
    "/api/upload/image": {
      post: {
        tags: ["Upload"],
        summary: "Subir imagen a Supabase Storage / S3",
        responses: {
          201: { description: "Imagen subida exitosamente" },
          400: { description: "Formato no permitido o tamaño excedido" },
        },
      },
    },
  },
};
