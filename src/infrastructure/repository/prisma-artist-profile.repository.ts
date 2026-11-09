import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  ArtistProfileFilters,
  IArtistProfileRepository,
} from "../../domain/repository/artist-profile.repository.interface.js";
import type { ArtistProfileModel } from "../../domain/models/artist-profile.model.js";
import { prisma } from "../prisma/prisma.client.js";

export class PrismaArtistProfileRepository implements IArtistProfileRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private mapToDomain(raw: any): ArtistProfileModel {
    return {
      id: raw.id,
      userId: raw.userId,
      bio: raw.bio,
      contactPhone: raw.contactPhone,
      contactSocial: raw.contactSocial,
      baseRate: raw.baseRate ? Number(raw.baseRate) : 0,
      city: raw.city,
      coverageArea: raw.coverageArea,
      category: raw.category,
      imageUrl: raw.imageUrl,
      isActive: raw.isActive,
      deletedAt: raw.deletedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.user
        ? {
            id: raw.user.id,
            name: raw.user.name,
            email: raw.user.email,
            emailVerified: raw.user.emailVerified,
            image: raw.user.image,
            role: raw.user.role,
            isActive: raw.user.isActive,
            deletedAt: raw.user.deletedAt,
            createdAt: raw.user.createdAt,
            updatedAt: raw.user.updatedAt,
          }
        : undefined,
    };
  }

  async findMany(
    filters: ArtistProfileFilters,
    skip: number,
    limit: number
  ): Promise<{ items: ArtistProfileModel[]; total: number }> {
    const where: Prisma.ArtistProfileWhereInput = {
      isActive: filters.isActive !== undefined ? filters.isActive : true,
    };

    if (filters.category) {
      where.category = { contains: filters.category, mode: "insensitive" };
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: "insensitive" };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.baseRate = {};
      if (filters.minPrice !== undefined) {
        where.baseRate.gte = new Prisma.Decimal(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        where.baseRate.lte = new Prisma.Decimal(filters.maxPrice);
      }
    }

    if (filters.search) {
      where.OR = [
        { bio: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
        { user: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.client.artistProfile.count({ where }),
      this.client.artistProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
    ]);

    return {
      total,
      items: rows.map((r) => this.mapToDomain(r)),
    };
  }

  async findById(id: string): Promise<ArtistProfileModel | null> {
    const row = await this.client.artistProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
        isActive: true,
      },
      include: { user: true },
    });

    return row ? this.mapToDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<ArtistProfileModel | null> {
    const row = await this.client.artistProfile.findFirst({
      where: { userId, isActive: true },
      include: { user: true },
    });

    return row ? this.mapToDomain(row) : null;
  }

  async create(data: {
    userId: string;
    bio?: string | null;
    contactPhone?: string | null;
    contactSocial?: string | null;
    baseRate: number;
    city: string;
    coverageArea?: string | null;
    category: string;
    imageUrl?: string | null;
  }): Promise<ArtistProfileModel> {
    const row = await this.client.artistProfile.create({
      data: {
        userId: data.userId,
        bio: data.bio ?? null,
        contactPhone: data.contactPhone ?? null,
        contactSocial: data.contactSocial ?? null,
        baseRate: new Prisma.Decimal(data.baseRate),
        city: data.city,
        coverageArea: data.coverageArea ?? null,
        category: data.category,
        imageUrl: data.imageUrl ?? null,
        isActive: true,
      },
      include: { user: true },
    });

    return this.mapToDomain(row);
  }

  async update(id: string, data: Partial<ArtistProfileModel>): Promise<ArtistProfileModel> {
    const updateData: Prisma.ArtistProfileUpdateInput = {};

    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.contactSocial !== undefined) updateData.contactSocial = data.contactSocial;
    if (data.baseRate !== undefined) updateData.baseRate = new Prisma.Decimal(data.baseRate);
    if (data.city !== undefined) updateData.city = data.city;
    if (data.coverageArea !== undefined) updateData.coverageArea = data.coverageArea;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.deletedAt !== undefined) updateData.deletedAt = data.deletedAt;

    const row = await this.client.artistProfile.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    return this.mapToDomain(row);
  }

  async softDelete(id: string): Promise<ArtistProfileModel> {
    const row = await this.client.artistProfile.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: { user: true },
    });

    return this.mapToDomain(row);
  }

  async updateImageUrl(id: string, imageUrl: string): Promise<ArtistProfileModel> {
    const row = await this.client.artistProfile.update({
      where: { id },
      data: { imageUrl },
      include: { user: true },
    });

    return this.mapToDomain(row);
  }
}

