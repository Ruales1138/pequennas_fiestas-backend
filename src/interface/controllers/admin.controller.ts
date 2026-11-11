import type { NextFunction, Request, Response } from "express";
import { PrismaUserRepository } from "../../infrastructure/repository/prisma-user.repository.js";
import { PrismaArtistProfileRepository } from "../../infrastructure/repository/prisma-artist-profile.repository.js";
import { PrismaBookingRepository } from "../../infrastructure/repository/prisma-booking.repository.js";
import { PrismaArtistRatingRepository } from "../../infrastructure/repository/prisma-artist-rating.repository.js";
import { NotFoundError } from "../../shared/errors.js";

export class AdminController {
  constructor(
    private readonly userRepo: PrismaUserRepository = new PrismaUserRepository(),
    private readonly artistRepo: PrismaArtistProfileRepository = new PrismaArtistProfileRepository(),
    private readonly bookingRepo: PrismaBookingRepository = new PrismaBookingRepository(),
    private readonly ratingRepo: PrismaArtistRatingRepository = new PrismaArtistRatingRepository()
  ) {}

  listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userRepo.findAll();
      const data = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        deletedAt: u.deletedAt ?? null,
        createdAt: u.createdAt,
      }));
      res.status(200).json({ ok: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.userRepo.findById(id);
      if (!existing) {
        throw new NotFoundError(`Usuario con ID '${id}' no encontrado`);
      }

      const nextActive =
        typeof req.body?.isActive === "boolean" ? req.body.isActive : !existing.isActive;
      const nextRole =
        typeof req.body?.role === "string" && req.body.role.trim()
          ? req.body.role.trim()
          : existing.role;

      const updated = await this.userRepo.update(id, {
        isActive: nextActive,
        deletedAt: nextActive ? null : new Date(),
        role: nextRole,
      });

      res.status(200).json({
        ok: true,
        message: nextActive
          ? "Usuario activado exitosamente"
          : "Usuario desactivado exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.userRepo.findById(id);
      if (!existing) {
        throw new NotFoundError(`Usuario con ID '${id}' no encontrado`);
      }

      const updated = await this.userRepo.update(id, {
        isActive: false,
        deletedAt: new Date(),
      });

      res.status(200).json({
        ok: true,
        message: "Usuario desactivado exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  listArtists = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rows = await this.artistRepo.findAllForAdmin();
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
        isActive: a.isActive,
        deletedAt: a.deletedAt ?? null,
        createdAt: a.createdAt,
      }));

      res.status(200).json({ ok: true, data: formatted });
    } catch (error) {
      next(error);
    }
  };

  updateArtistStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.artistRepo.findByIdForAdmin(id);
      if (!existing) {
        throw new NotFoundError(`Perfil de artista con ID '${id}' no encontrado`);
      }

      const nextActive =
        typeof req.body?.isActive === "boolean" ? req.body.isActive : !existing.isActive;

      const updated = await this.artistRepo.update(existing.id, {
        isActive: nextActive,
        deletedAt: nextActive ? null : new Date(),
      });

      res.status(200).json({
        ok: true,
        message: nextActive
          ? "Perfil de artista activado exitosamente"
          : "Perfil de artista desactivado exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteArtist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.artistRepo.findByIdForAdmin(id);
      if (!existing) {
        throw new NotFoundError(`Perfil de artista con ID '${id}' no encontrado`);
      }

      const updated = await this.artistRepo.softDelete(existing.id);

      res.status(200).json({
        ok: true,
        message: "Perfil de artista desactivado exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  listBookings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rows = await this.bookingRepo.findAllForAdmin();
      const formatted = rows.map((b) => ({
        id: b.id,
        title: `${b.client?.name ?? "Cliente"} → ${b.artist?.name ?? "Artista"} (${b.eventLocation})`,
        name: `${b.client?.name ?? "Cliente"} → ${b.artist?.name ?? "Artista"}`,
        role: b.status,
        clientId: b.clientId,
        artistId: b.artistId,
        clientName: b.client?.name ?? "",
        artistName: b.artist?.name ?? "",
        eventDate: b.eventDate,
        eventLocation: b.eventLocation,
        description: b.description,
        jobHours: Number(b.jobHours),
        agreedPrice: Number(b.agreedPrice),
        status: b.status,
        isActive: b.isActive,
        deletedAt: b.deletedAt ?? null,
        createdAt: b.createdAt,
      }));

      res.status(200).json({ ok: true, data: formatted });
    } catch (error) {
      next(error);
    }
  };

  updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.bookingRepo.findByIdForAdmin(id);
      if (!existing) {
        throw new NotFoundError(`Reserva con ID '${id}' no encontrada`);
      }

      const nextActive =
        typeof req.body?.isActive === "boolean" ? req.body.isActive : !existing.isActive;
      const nextStatus =
        typeof req.body?.status === "string" && req.body.status.trim()
          ? req.body.status.trim()
          : nextActive
            ? existing.status === "cancelada"
              ? "pendiente"
              : existing.status
            : "cancelada";

      const updated = await this.bookingRepo.update(existing.id, {
        isActive: nextActive,
        deletedAt: nextActive ? null : new Date(),
        status: nextStatus,
      });

      res.status(200).json({
        ok: true,
        message: nextActive
          ? "Reserva activada/actualizada exitosamente"
          : "Reserva desactivada exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.bookingRepo.findByIdForAdmin(id);
      if (!existing) {
        throw new NotFoundError(`Reserva con ID '${id}' no encontrada`);
      }

      const updated = await this.bookingRepo.softDelete(existing.id);

      res.status(200).json({
        ok: true,
        message: "Reserva desactivada exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  listRatings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rows = await this.ratingRepo.findAllForAdmin();
      const formatted = rows.map((r) => ({
        id: r.id,
        title: `${r.client?.name ?? "Cliente"} ★${Number(r.rating)} a ${r.artist?.name ?? "Artista"}`,
        name: r.comment ?? `Calificación ${Number(r.rating)}/5`,
        role: `${Number(r.rating)} ★`,
        artistId: r.artistId,
        clientId: r.clientId,
        clientName: r.client?.name ?? "",
        artistName: r.artist?.name ?? "",
        rating: Number(r.rating),
        comment: r.comment,
        isActive: r.isActive,
        deletedAt: r.deletedAt ?? null,
        createdAt: r.createdAt,
      }));

      res.status(200).json({ ok: true, data: formatted });
    } catch (error) {
      next(error);
    }
  };

  updateRatingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.ratingRepo.findByIdForAdmin(id);
      if (!existing) {
        throw new NotFoundError(`Calificación con ID '${id}' no encontrada`);
      }

      const nextActive =
        typeof req.body?.isActive === "boolean" ? req.body.isActive : !existing.isActive;

      const updated = await this.ratingRepo.update(existing.id, {
        isActive: nextActive,
        deletedAt: nextActive ? null : new Date(),
      });

      res.status(200).json({
        ok: true,
        message: nextActive
          ? "Calificación activada exitosamente"
          : "Calificación desactivada exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.ratingRepo.findByIdForAdmin(id);
      if (!existing) {
        throw new NotFoundError(`Calificación con ID '${id}' no encontrada`);
      }

      const updated = await this.ratingRepo.softDelete(existing.id);

      res.status(200).json({
        ok: true,
        message: "Calificación desactivada exitosamente (borrado lógico)",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
