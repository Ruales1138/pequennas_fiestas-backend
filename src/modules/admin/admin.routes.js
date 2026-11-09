import express from "express";
import { desc, eq } from "drizzle-orm";

import { db } from "../../config/db.js";
import { user } from "../../schemas/schema.js";
import { artistProfiles, bookings } from "../../schemas/app.schema.js";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";

export const adminRouter = express.Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole("admin"));

adminRouter.get("/users", async (_req, res) => {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return res.json({ ok: true, data: rows });
});

adminRouter.get("/artists", async (_req, res) => {
  const rows = await db
    .select({
      id: artistProfiles.id,
      userId: artistProfiles.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      city: artistProfiles.city,
      category: artistProfiles.category,
      baseRate: artistProfiles.baseRate,
      bio: artistProfiles.bio,
    })
    .from(artistProfiles)
    .leftJoin(user, eq(artistProfiles.userId, user.id))
    .orderBy(desc(artistProfiles.id));

  return res.json({ ok: true, data: rows });
});

adminRouter.get("/bookings", async (_req, res) => {
  const rows = await db
    .select({
      id: bookings.id,
      clientId: bookings.clientId,
      artistId: bookings.artistId,
      eventDate: bookings.eventDate,
      eventLocation: bookings.eventLocation,
      description: bookings.description,
      jobHours: bookings.jobHours,
      agreedPrice: bookings.agreedPrice,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .orderBy(desc(bookings.createdAt));

  return res.json({ ok: true, data: rows });
});
