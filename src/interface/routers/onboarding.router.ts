import { Router, type Request, type Response } from "express";
import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { auth } from "../../config/auth.js";
import { verifyJwtToken } from "../../infrastructure/services/jwt-auth.service.js";

export const onboardingRouter = Router();

async function resolveAuthenticatedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === "string") {
    const [scheme, token] = authHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() === "bearer" && token) {
      try {
        const decoded = verifyJwtToken(token);
        if (decoded?.id) return decoded.id;
      } catch {
        // Fallback to session lookup if token is not a JWT
      }
    }
  }

  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

onboardingRouter.post("/role", async (req: Request, res: Response) => {
  try {
    const userId = await resolveAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized", message: "No autorizado" });
    }

    const { role } = req.body ?? {};

    if (role === "admin") {
      return res.status(403).json({
        ok: false,
        error: "No está permitido auto-asignarse el rol de administrador",
        message: "No está permitido auto-asignarse el rol de administrador",
      });
    }

    if (role !== "cliente" && role !== "artista") {
      return res.status(400).json({ ok: false, error: "Invalid role", message: "Rol inválido" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    if (role === "artista") {
      const existing = await prisma.artistProfile.findUnique({
        where: { userId },
      });

      if (!existing) {
        await prisma.artistProfile.create({
          data: {
            userId,
            city: "Medellín",
            category: "General",
            baseRate: 0,
          },
        });
      }
    }

    return res.json({ ok: true, role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
});

onboardingRouter.post("/artist-profile", async (req: Request, res: Response) => {
  try {
    const userId = (await resolveAuthenticatedUserId(req)) ?? req.body?.userId ?? null;

    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized", message: "No autorizado" });
    }

    const { bio, contactPhone, contactSocial, baseRate, city, coverageArea, category } = req.body ?? {};

    const updated = await prisma.artistProfile.upsert({
      where: { userId },
      update: {
        bio: bio ?? null,
        contactPhone: contactPhone ?? null,
        contactSocial: contactSocial ?? null,
        baseRate: baseRate ? Number(baseRate) : 0,
        city: city ?? "Medellín",
        coverageArea: coverageArea ?? null,
        category: category ?? "General",
      },
      create: {
        userId,
        bio: bio ?? null,
        contactPhone: contactPhone ?? null,
        contactSocial: contactSocial ?? null,
        baseRate: baseRate ? Number(baseRate) : 0,
        city: city ?? "Medellín",
        coverageArea: coverageArea ?? null,
        category: category ?? "General",
      },
    });

    return res.json({ ok: true, profile: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
});
