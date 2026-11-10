export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "GigaShow API",
    version: "1.0.0",
    description: "API para artistas, clientes y reservas de GigaShow.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local de desarrollo",
    },
  ],
  tags: [
    { name: "Health", description: "Monitoreo y estado de salud" },
    { name: "Artists", description: "Gestión de perfiles de artistas y catálogo" },
    { name: "Bookings", description: "Gestión de reservas de eventos" },
    { name: "Ratings", description: "Calificaciones y reseñas de artistas" },
    { name: "Upload", description: "Subida de imágenes a Supabase Storage / S3" },
  ],
  paths: {
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
          400: { description: "Parámetros de consulta inválidos" },
        },
      },
      post: {
        tags: ["Artists"],
        summary: "Crear un nuevo perfil de artista",
        description: "Nota: Buri debe proteger esta ruta con requireAuth / requireRole",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "city", "category", "baseRate"],
                properties: {
                  userId: { type: "string" },
                  city: { type: "string" },
                  category: { type: "string" },
                  baseRate: { type: "number" },
                  bio: { type: "string" },
                  contactPhone: { type: "string" },
                  contactSocial: { type: "string" },
                  coverageArea: { type: "string" },
                  imageUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Artista creado exitosamente" },
          400: { description: "Datos de entrada inválidos" },
          409: { description: "El usuario ya tiene un perfil de artista" },
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
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "clientId", in: "query", schema: { type: "string" } },
          { name: "artistId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Lista paginada de reservas" },
        },
      },
      post: {
        tags: ["Bookings"],
        summary: "Crear una nueva reserva",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["clientId", "artistId", "eventDate", "eventLocation", "jobHours", "agreedPrice"],
                properties: {
                  clientId: { type: "string" },
                  artistId: { type: "string" },
                  eventDate: { type: "string", format: "date-time" },
                  eventLocation: { type: "string" },
                  description: { type: "string" },
                  jobHours: { type: "number" },
                  agreedPrice: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Reserva creada exitosamente" },
          400: { description: "Validación de horario o datos erróneos" },
          409: { description: "Conflicto de disponibilidad del artista" },
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
        summary: "Borrado lógico de reserva (cancelar)",
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
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "artistId", in: "query", schema: { type: "string" } },
          { name: "clientId", in: "query", schema: { type: "string" } },
          { name: "minRating", in: "query", schema: { type: "number" } },
        ],
        responses: {
          200: { description: "Listado paginado de calificaciones" },
        },
      },
      post: {
        tags: ["Ratings"],
        summary: "Crear una calificación para un artista",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["artistId", "clientId", "rating"],
                properties: {
                  artistId: { type: "string" },
                  clientId: { type: "string" },
                  rating: { type: "number", minimum: 1, maximum: 5 },
                  comment: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Calificación creada" },
          400: { description: "Datos inválidos o auto-calificación" },
          409: { description: "El cliente ya calificó a este artista" },
        },
      },
    },
    "/api/upload/image": {
      post: {
        tags: ["Upload"],
        summary: "Subir imagen a Supabase Storage / S3",
        description:
          "Sube una imagen binaria (JPG, PNG, WEBP, GIF, máx 5MB) a Supabase Storage y opcionalmente asocia la URL al perfil del artista en la BD. NOTA PARA BURI: Aplicar requireAuth aquí.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: { type: "string", format: "binary" },
                  artistId: { type: "string", description: "ID opcional del artista a actualizar" },
                  userId: { type: "string", description: "ID opcional del usuario a actualizar" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Imagen subida exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    fileUrl: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Formato no permitido o tamaño excedido" },
        },
      },
    },
  },
};
