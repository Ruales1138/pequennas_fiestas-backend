import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./config/openapi.js";
import { checkPrismaConnection, prisma } from "./infrastructure/prisma/prisma.client.js";
import { uploadedFilesStore } from "./infrastructure/services/supabase-storage.service.js";

// Importación de routers de las cuatro capas limpias
import { artistRouter } from "./interface/routers/artist.router.js";
import { bookingRouter } from "./interface/routers/booking.router.js";
import { ratingRouter } from "./interface/routers/rating.router.js";
import { uploadRouter } from "./interface/routers/upload.router.js";
import { globalErrorHandler } from "./interface/middlewares/error.middleware.js";

// Compatibilidad hacia atrás para módulos de administración y autenticación
import { authRouter } from "./interface/routers/auth.router.js";
import { adminRouter } from "./interface/routers/admin.router.js";
import { onboardingRouter } from "./interface/routers/onboarding.router.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173,http://localhost:3000,http://localhost:3001,http://localhost:8081")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(normalized) ||
        normalized.endsWith(".vercel.app") ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

// Documentación OpenAPI / Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(openApiDocument);
});

// Rutas de autenticación y onboarding (módulos asignados a Buri)
app.use("/api/auth", authRouter);
app.use("/api/auth", toNodeHandler(auth));
app.use("/api/onboarding", onboardingRouter);
app.use("/api/admin", adminRouter);

// Rutas de dominio bajo arquitectura limpia (asignadas a Pinilla)
app.use("/api/artists", artistRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/upload", uploadRouter);

// Servir archivos subidos al bucket S3/Supabase compatible cuando no hay bucket externo configurado
app.get(
  "/storage/v1/object/public/:bucket/:folder/:filename",
  (req: Request, res: Response) => {
    const key = `${req.params.bucket}/${req.params.folder}/${req.params.filename}`;
    const stored = uploadedFilesStore.get(key);
    if (!stored) {
      res.status(404).json({ message: "Archivo no encontrado" });
      return;
    }
    res.setHeader("Content-Type", stored.mimetype);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.send(stored.buffer);
  }
);

// Endpoints de salud y verificación
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/health/db", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const isConnected = await checkPrismaConnection();
    res.json({
      ok: isConnected,
      engine: "Prisma ORM",
      database: "PostgreSQL",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/db/tables", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const columns: Array<{
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    }> = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    const [usersCount, artistsCount, bookingsCount, ratingsCount] = await Promise.all([
      prisma.user.count(),
      prisma.artistProfile.count(),
      prisma.booking.count(),
      prisma.artistRating.count(),
    ]);

    res.json({
      ok: true,
      engine: "PostgreSQL + Prisma ORM",
      count: tables.length,
      data: tables.map((t) => t.table_name),
      rowCounts: {
        users: usersCount,
        artist_profiles: artistsCount,
        bookings: bookingsCount,
        artist_ratings: ratingsCount,
      },
      foreignKeys: [
        "artist_profiles.userId -> users.id (ON DELETE CASCADE)",
        "bookings.clientId -> users.id (ON DELETE CASCADE)",
        "bookings.artistId -> users.id (ON DELETE CASCADE)",
        "artist_ratings.artistId -> users.id (ON DELETE CASCADE)",
        "artist_ratings.clientId -> users.id (ON DELETE CASCADE)",
      ],
      columnsByTable: columns.reduce<Record<string, Array<{ column: string; type: string; nullable: boolean }>>>(
        (acc, col) => {
          if (!acc[col.table_name]) acc[col.table_name] = [];
          acc[col.table_name].push({
            column: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === "YES",
          });
          return acc;
        },
        {}
      ),
    });
  } catch (error) {
    next(error);
  }
});

// Middleware centralizado de manejo de errores
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
    console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
  });
}

export default app;

