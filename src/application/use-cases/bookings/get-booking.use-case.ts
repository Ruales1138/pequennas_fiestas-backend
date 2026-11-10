import type { IBookingRepository } from "../../../domain/repository/booking.repository.interface.js";
import type { BookingModel } from "../../../domain/models/booking.model.js";
import { NotFoundError } from "../../../shared/errors.js";

export class GetBookingByIdUseCase {
  constructor(private readonly bookingRepo: IBookingRepository) {}

  async execute(id: string): Promise<BookingModel> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) {
      throw new NotFoundError(`Reserva con ID '${id}' no encontrada`);
    }
    return booking;
  }
}

