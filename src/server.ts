import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./config/openapi.js";
import { checkPrismaConnection, prisma } from "./infrastructure/prisma/prisma.client.js";

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

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
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
    res.json({
      ok: true,
      count: tables.length,
      data: tables.map((t) => t.table_name),
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

