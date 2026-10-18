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
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Health", description: "Estado del backend y la base de datos" },
    { name: "Artists", description: "Catálogo de artistas" },
    { name: "Bookings", description: "Gestión de reservas" },
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
        summary: "Verificar la conexión con la base de datos",
        responses: {
          200: { description: "Base de datos disponible" },
          500: { description: "No fue posible conectar con la base de datos" },
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
  },
};
