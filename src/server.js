import express from "express";
import cors from "cors";
import "dotenv/config";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { checkDbConnection, sql } from "./config/db.js";
import { onboardingRouter } from "./modules/auth/onboarding.routes.js";
import { artistsRouter } from "./modules/artists/artists.routes.js";
import { UploadRouter } from "./modules/upload/upload.routes.js";
import { bookingsRouter } from "./modules/bookings/bookings.routes.js";
import { fileURLToPath } from 'url'
import path from 'path'

const app = express();

async function ensureArtistRatingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS artist_ratings (
      id uuid PRIMARY KEY,
      artist_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      client_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      rating numeric(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment text,
      created_at timestamp NOT NULL DEFAULT NOW(),
      updated_at timestamp NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS artist_ratings_artist_client_unique
    ON artist_ratings (artist_id, client_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS artist_ratings_artist_idx
    ON artist_ratings (artist_id)
  `;
}


app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", toNodeHandler(auth));
app.use("/api/onboarding", onboardingRouter);
app.use("/api/artists", artistsRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api/upload', UploadRouter)
app.use('/api/bookings', bookingsRouter)

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/health/db", async (_req, res, next) => {
  try {
    const result = await sql`select now() as now`;
    return res.json({ ok: true, dbTime: result[0]?.now ?? null });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/db/tables", async (_req, res, next) => {
  try {
    const result = await sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      and table_type = 'BASE TABLE'
      order by table_name
    `;

    return res.json({
      ok: true,
      count: result.length,
      data: result.map((table) => table.table_name),
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({
    ok: false,
    message: error?.message ?? "Internal Server Error",
  });
});

async function startServer() {
  try {
    await checkDbConnection();
    await ensureArtistRatingsTable();
    const port = process.env.PORT ?? 3000;

    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
      console.log("Neon DB connection: OK");
    });
  } catch (error) {
    console.error("Neon DB connection: FAIL");
    console.error(error);
    process.exit(1);
  }
}

startServer();