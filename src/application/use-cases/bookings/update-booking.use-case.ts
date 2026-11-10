import type { IBookingRepository } from "../../../domain/repository/booking.repository.interface.js";
import type { BookingModel } from "../../../domain/models/booking.model.js";
import type { UpdateBookingDto } from "../../../infrastructure/dtos/booking.dto.js";
import { ConflictError, NotFoundError } from "../../../shared/errors.js";

export class UpdateBookingUseCase {
  constructor(private readonly bookingRepo: IBookingRepository) {}

  async execute(id: string, dto: UpdateBookingDto): Promise<BookingModel> {
    const existing = await this.bookingRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Reserva con ID '${id}' no encontrada`);
    }

    if (dto.eventDate || dto.jobHours) {
      const checkDate = dto.eventDate ?? existing.eventDate;
      const checkHours = dto.jobHours ?? existing.jobHours;
      const hasConflict = await this.bookingRepo.hasConflict(
        existing.artistId,
        checkDate,
        checkHours,
        existing.id
      );
      if (hasConflict) {
        throw new ConflictError("El nuevo horario entra en conflicto con otra reserva existente");
      }
    }

    return this.bookingRepo.update(existing.id, dto);
  }
}

