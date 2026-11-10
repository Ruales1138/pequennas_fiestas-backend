import type {
  BookingFilters,
  IBookingRepository,
} from "../../../domain/repository/booking.repository.interface.js";
import type { BookingModel } from "../../../domain/models/booking.model.js";
import {
  buildPaginatedResponse,
  parsePaginationParams,
  type PaginatedResponse,
} from "../../../shared/pagination.js";

export class ListBookingsUseCase {
  constructor(private readonly bookingRepo: IBookingRepository) {}

  async execute(
    query: Record<string, unknown>
  ): Promise<PaginatedResponse<BookingModel>> {
    const { currentPage, limit, skip } = parsePaginationParams(query);

    const filters: BookingFilters = {
      clientId: typeof query.clientId === "string" ? query.clientId : undefined,
      artistId: typeof query.artistId === "string" ? query.artistId : undefined,
      status: typeof query.status === "string" ? query.status : undefined,
    };

    const { items, total } = await this.bookingRepo.findMany(filters, skip, limit);

    return buildPaginatedResponse(items, total, currentPage, limit);
  }
}

