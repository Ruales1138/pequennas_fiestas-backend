import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  IArtistRatingRepository,
  RatingFilters,
} from "../../domain/repository/artist-rating.repository.interface.js";
import type { ArtistRatingModel } from "../../domain/models/artist-rating.model.js";
import { prisma } from "../prisma/prisma.client.js";

export class PrismaArtistRatingRepository implements IArtistRatingRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private mapToDomain(raw: any): ArtistRatingModel {
    return {
      id: raw.id,
      artistId: raw.artistId,
      clientId: raw.clientId,
      rating: raw.rating ? Number(raw.rating) : 0,
      comment: raw.comment,
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
    filters: RatingFilters,
    skip: number,
    limit: number
  ): Promise<{ items: ArtistRatingModel[]; total: number }> {
    const where: Prisma.ArtistRatingWhereInput = {
      isActive: filters.isActive !== undefined ? filters.isActive : true,
    };

    if (filters.artistId) {
      where.artistId = filters.artistId;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.minRating !== undefined) {
      where.rating = { gte: new Prisma.Decimal(filters.minRating) };
    }

    const [total, rows] = await Promise.all([
      this.client.artistRating.count({ where }),
      this.client.artistRating.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { client: true, artist: true },
      }),
    ]);

    return {
      total,
      items: rows.map((r) => this.mapToDomain(r)),
    };
  }

  async findById(id: string): Promise<ArtistRatingModel | null> {
    const row = await this.client.artistRating.findFirst({
      where: { id, isActive: true },
      include: { client: true, artist: true },
    });

    return row ? this.mapToDomain(row) : null;
  }

  async findByArtistAndClient(artistId: string, clientId: string): Promise<ArtistRatingModel | null> {
    const row = await this.client.artistRating.findFirst({
      where: { artistId, clientId, isActive: true },
      include: { client: true, artist: true },
    });

    return row ? this.mapToDomain(row) : null;
  }

  async create(data: {
    artistId: string;
    clientId: string;
    rating: number;
    comment?: string | null;
  }): Promise<ArtistRatingModel> {
    const row = await this.client.artistRating.create({
      data: {
        artistId: data.artistId,
        clientId: data.clientId,
        rating: new Prisma.Decimal(data.rating),
        comment: data.comment ?? null,
        isActive: true,
      },
      include: { client: true, artist: true },
    });

    return this.mapToDomain(row);
  }

  async update(id: string, data: Partial<ArtistRatingModel>): Promise<ArtistRatingModel> {
    const updateData: Prisma.ArtistRatingUpdateInput = {};

    if (data.rating !== undefined) updateData.rating = new Prisma.Decimal(data.rating);
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.deletedAt !== undefined) updateData.deletedAt = data.deletedAt;

    const row = await this.client.artistRating.update({
      where: { id },
      data: updateData,
      include: { client: true, artist: true },
    });

    return this.mapToDomain(row);
  }

  async softDelete(id: string): Promise<ArtistRatingModel> {
    const row = await this.client.artistRating.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: { client: true, artist: true },
    });

    return this.mapToDomain(row);
  }

  async getAverageRating(artistId: string): Promise<{ average: number; count: number }> {
    const ratings = await this.client.artistRating.findMany({
      where: { artistId, isActive: true },
      select: { rating: true },
    });

    if (ratings.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = ratings.reduce((acc, curr) => acc + Number(curr.rating), 0);
    const average = Number((sum / ratings.length).toFixed(1));

    return { average, count: ratings.length };
  }
}

