import type { BookingModel } from "../models/booking.model.js";

export interface BookingFilters {
  clientId?: string;
  artistId?: string;
  status?: string;
  isActive?: boolean;
}

export interface IBookingRepository {
  findMany(
    filters: BookingFilters,
    skip: number,
    limit: number
  ): Promise<{ items: BookingModel[]; total: number }>;
  findById(id: string): Promise<BookingModel | null>;
  create(data: {
    clientId: string;
    artistId: string;
    eventDate: Date;
    eventLocation: string;
    description?: string | null;
    jobHours: number;
    agreedPrice: number;
    status?: string;
  }): Promise<BookingModel>;
  update(id: string, data: Partial<BookingModel>): Promise<BookingModel>;
  softDelete(id: string): Promise<BookingModel>;
  hasConflict(artistId: string, eventDate: Date, jobHours: number, excludeBookingId?: string): Promise<boolean>;
}

