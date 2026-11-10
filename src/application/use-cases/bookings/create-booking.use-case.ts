import type { IBookingRepository } from "../../../domain/repository/booking.repository.interface.js";
import type { BookingModel } from "../../../domain/models/booking.model.js";
import type { CreateBookingDto } from "../../../infrastructure/dtos/booking.dto.js";
import { BadRequestError, ConflictError } from "../../../shared/errors.js";

export class CreateBookingUseCase {
  constructor(private readonly bookingRepo: IBookingRepository) {}

  async execute(dto: CreateBookingDto): Promise<BookingModel> {
    if (dto.clientId === dto.artistId) {
      throw new BadRequestError("No puedes crear una reserva para ti mismo");
    }

    const hasConflict = await this.bookingRepo.hasConflict(
      dto.artistId,
      dto.eventDate,
      dto.jobHours
    );

    if (hasConflict) {
      throw new ConflictError("El artista ya tiene un evento programado en ese horario");
    }

    return this.bookingRepo.create({
      clientId: dto.clientId,
      artistId: dto.artistId,
      eventDate: dto.eventDate,
      eventLocation: dto.eventLocation,
      description: dto.description ?? null,
      jobHours: dto.jobHours,
      agreedPrice: dto.agreedPrice,
      status: dto.status ?? "pendiente",
    });
  }
}

