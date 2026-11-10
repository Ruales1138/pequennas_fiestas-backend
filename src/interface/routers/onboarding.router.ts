import { Router, type Request, type Response } from "express";
import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { auth } from "../../config/auth.js";

export const onboardingRouter = Router();

onboardingRouter.post("/role", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;
    const { role } = req.body ?? {};

    if (role !== "cliente" && role !== "artista") {
      return res.status(400).json({ error: "Invalid role" });
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

onboardingRouter.post("/artist-profile", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
