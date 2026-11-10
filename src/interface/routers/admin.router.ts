import { Router } from "express";
import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole("admin"));

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const rows = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return next(error);
  }
});

adminRouter.get("/artists", async (_req, res, next) => {
  try {
    const rows = await prisma.artistProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = rows.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: a.user?.name ?? "",
      email: a.user?.email ?? "",
      role: a.user?.role ?? "artista",
      city: a.city,
      category: a.category,
      baseRate: Number(a.baseRate),
      bio: a.bio,
    }));

    return res.json({ ok: true, data: formatted });
  } catch (error) {
    return next(error);
  }
});

adminRouter.get("/bookings", async (_req, res, next) => {
  try {
    const rows = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = rows.map((b) => ({
      id: b.id,
      clientId: b.clientId,
      artistId: b.artistId,
      eventDate: b.eventDate,
      eventLocation: b.eventLocation,
      description: b.description,
      jobHours: Number(b.jobHours),
      agreedPrice: Number(b.agreedPrice),
      status: b.status,
      createdAt: b.createdAt,
    }));

    return res.json({ ok: true, data: formatted });
  } catch (error) {
    return next(error);
  }
});
