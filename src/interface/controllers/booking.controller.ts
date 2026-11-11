import type { NextFunction, Request, Response } from "express";
import {
  ListBookingsUseCase,
  GetBookingByIdUseCase,
  CreateBookingUseCase,
  UpdateBookingUseCase,
  DeleteBookingUseCase,
} from "../../application/index.js";
import {
  createBookingSchema,
  updateBookingSchema,
  bookingFilterQuerySchema,
} from "../../infrastructure/dtos/booking.dto.js";
import { PrismaArtistProfileRepository } from "../../infrastructure/repository/prisma-artist-profile.repository.js";

export class BookingController {
  constructor(
    private readonly listBookingsUseCase: ListBookingsUseCase,
    private readonly getBookingByIdUseCase: GetBookingByIdUseCase,
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly updateBookingUseCase: UpdateBookingUseCase,
    private readonly deleteBookingUseCase: DeleteBookingUseCase,
    private readonly artistRepo?: PrismaArtistProfileRepository
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      bookingFilterQuerySchema.parse(req.query);
      const result = await this.listBookingsUseCase.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listForArtist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = (req as any).user;
      const artistUserId = String(req.query.artistId ?? authUser?.id ?? "");
      const result = await this.listBookingsUseCase.execute({
        ...req.query,
        artistId: artistUserId || undefined,
        limit: String(req.query.limit ?? "100"),
      });

      const formatted = result.data.map((b) => ({
        ...b,
        clientName: b.client?.name ?? "Cliente",
        clientEmail: b.client?.email ?? "",
        clientImage: b.client?.image ?? null,
      }));

      res.status(200).json({
        data: formatted,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const booking = await this.getBookingByIdUseCase.execute(id);
      res.status(200).json({ data: booking });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = (req as any).user;
      let resolvedArtistId = req.body?.artistId;

      if (resolvedArtistId && this.artistRepo) {
        const profile = await this.artistRepo.findById(String(resolvedArtistId));
        if (profile?.userId) {
          resolvedArtistId = profile.userId;
        }
      }

      const payload = {
        ...req.body,
        clientId: req.body?.clientId ?? authUser?.id,
        artistId: resolvedArtistId,
      };

      const validated = createBookingSchema.parse(payload);
      const booking = await this.createBookingUseCase.execute(validated);
      res.status(201).json({
        message: "Reserva creada exitosamente",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const validated = updateBookingSchema.parse(req.body);
      const booking = await this.updateBookingUseCase.execute(id, validated);
      res.status(200).json({
        message: "Reserva actualizada exitosamente",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const booking = await this.deleteBookingUseCase.execute(id);
      res.status(200).json({
        message: "Reserva cancelada y desactivada exitosamente (borrado lógico)",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };
}
