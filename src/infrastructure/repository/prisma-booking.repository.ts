import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  BookingFilters,
  IBookingRepository,
} from "../../domain/repository/booking.repository.interface.js";
import type { BookingModel } from "../../domain/models/booking.model.js";
import { prisma } from "../prisma/prisma.client.js";

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private mapToDomain(raw: any): BookingModel {
    return {
      id: raw.id,
      clientId: raw.clientId,
      artistId: raw.artistId,
      eventDate: raw.eventDate,
      eventLocation: raw.eventLocation,
      description: raw.description,
      jobHours: raw.jobHours ? Number(raw.jobHours) : 1,
      agreedPrice: raw.agreedPrice ? Number(raw.agreedPrice) : 0,
      status: raw.status,
      isActive: raw.isActive,
      deletedAt: raw.deletedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      client: raw.client
        ? {
            id: raw.client.id,
            name: raw.client.name,
            email: raw.client.email,
            emailVerified: raw.client.emailVerified,
            image: raw.client.image,
            role: raw.client.role,
            isActive: raw.client.isActive,
            deletedAt: raw.client.deletedAt,
            createdAt: raw.client.createdAt,
            updatedAt: raw.client.updatedAt,
          }
        : undefined,
      artist: raw.artist
        ? {
            id: raw.artist.id,
            name: raw.artist.name,
            email: raw.artist.email,
            emailVerified: raw.artist.emailVerified,
            image: raw.artist.image,
            role: raw.artist.role,
            isActive: raw.artist.isActive,
            deletedAt: raw.artist.deletedAt,
            createdAt: raw.artist.createdAt,
            updatedAt: raw.artist.updatedAt,
          }
        : undefined,
    };
  }

  async findMany(
    filters: BookingFilters,
    skip: number,
    limit: number
  ): Promise<{ items: BookingModel[]; total: number }> {
    const where: Prisma.BookingWhereInput = {
      isActive: filters.isActive !== undefined ? filters.isActive : true,
    };

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.artistId) {
      where.artistId = filters.artistId;
    }

    if (filters.status) {
      where.status = { equals: filters.status, mode: "insensitive" };
    }

    const [total, rows] = await Promise.all([
      this.client.booking.count({ where }),
      this.client.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: "asc" },
        include: { client: true, artist: true },
      }),
    ]);

    return {
      total,
      items: rows.map((r) => this.mapToDomain(r)),
    };
  }

  async findById(id: string): Promise<BookingModel | null> {
    const row = await this.client.booking.findFirst({
      where: { id, isActive: true },
      include: { client: true, artist: true },
    });

    return row ? this.mapToDomain(row) : null;
  }

  async create(data: {
    clientId: string;
    artistId: string;
    eventDate: Date;
    eventLocation: string;
    description?: string | null;
    jobHours: number;
    agreedPrice: number;
    status?: string;
  }): Promise<BookingModel> {
    const row = await this.client.booking.create({
      data: {
        clientId: data.clientId,
        artistId: data.artistId,
        eventDate: data.eventDate,
        eventLocation: data.eventLocation,
        description: data.description ?? null,
        jobHours: new Prisma.Decimal(data.jobHours),
        agreedPrice: new Prisma.Decimal(data.agreedPrice),
        status: data.status ?? "pendiente",
        isActive: true,
      },
      include: { client: true, artist: true },
    });

    return this.mapToDomain(row);
  }

  async update(id: string, data: Partial<BookingModel>): Promise<BookingModel> {
    const updateData: Prisma.BookingUpdateInput = {};

    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;
    if (data.eventLocation !== undefined) updateData.eventLocation = data.eventLocation;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.jobHours !== undefined) updateData.jobHours = new Prisma.Decimal(data.jobHours);
    if (data.agreedPrice !== undefined) updateData.agreedPrice = new Prisma.Decimal(data.agreedPrice);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.deletedAt !== undefined) updateData.deletedAt = data.deletedAt;

    const row = await this.client.booking.update({
      where: { id },
      data: updateData,
      include: { client: true, artist: true },
    });

    return this.mapToDomain(row);
  }

  async softDelete(id: string): Promise<BookingModel> {
    const row = await this.client.booking.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        status: "cancelada",
      },
      include: { client: true, artist: true },
    });

    return this.mapToDomain(row);
  }

  async hasConflict(
    artistId: string,
    eventDate: Date,
    jobHours: number,
    excludeBookingId?: string
  ): Promise<boolean> {
    const startTime = new Date(eventDate);
    const endTime = new Date(startTime.getTime() + jobHours * 60 * 60 * 1000);

    const where: Prisma.BookingWhereInput = {
      artistId,
      isActive: true,
      status: { notIn: ["rechazada", "cancelada"] },
    };

    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const bookings = await this.client.booking.findMany({ where });

    return bookings.some((b) => {
      const bStart = new Date(b.eventDate);
      const bHours = Number(b.jobHours) || 1;
      const bEnd = new Date(bStart.getTime() + bHours * 60 * 60 * 1000);

      return startTime < bEnd && endTime > bStart;
    });
  }

  async findAllForAdmin(): Promise<BookingModel[]> {
    const rows = await this.client.booking.findMany({
      include: { client: true, artist: true },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((r) => this.mapToDomain(r));
  }

  async findByIdForAdmin(id: string): Promise<BookingModel | null> {
    const row = await this.client.booking.findFirst({
      where: { id },
      include: { client: true, artist: true },
    });

    return row ? this.mapToDomain(row) : null;
  }
}

