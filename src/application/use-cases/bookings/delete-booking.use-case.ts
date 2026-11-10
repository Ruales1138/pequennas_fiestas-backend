import type { IBookingRepository } from "../../../domain/repository/booking.repository.interface.js";
import type { BookingModel } from "../../../domain/models/booking.model.js";
import { NotFoundError } from "../../../shared/errors.js";

export class DeleteBookingUseCase {
  constructor(private readonly bookingRepo: IBookingRepository) {}

  async execute(id: string): Promise<BookingModel> {
    const existing = await this.bookingRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Reserva con ID '${id}' no encontrada`);
    }

    return this.bookingRepo.softDelete(existing.id);
  }
}

