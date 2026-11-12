import type { PrismaClient } from "@prisma/client";
import type { UserModel } from "../../domain/models/user.model.js";
import type {
  CreateUserInput,
  IUserRepository,
  UserWithPasswordModel,
} from "../../domain/repository/user.repository.interface.js";
import { prisma } from "../prisma/prisma.client.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private mapToPublic(raw: any): UserModel {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      emailVerified: raw.emailVerified,
      image: raw.image,
      role: raw.role,
      isActive: raw.isActive,
      deletedAt: raw.deletedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private mapWithPassword(raw: any): UserWithPasswordModel {
    return {
      ...this.mapToPublic(raw),
      password: raw.password ?? null,
    };
  }

  async findByEmail(email: string): Promise<UserWithPasswordModel | null> {
    const row = await this.client.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    return row ? this.mapWithPassword(row) : null;
  }

  async findById(id: string): Promise<UserWithPasswordModel | null> {
    const row = await this.client.user.findUnique({
      where: { id },
    });
    return row ? this.mapWithPassword(row) : null;
  }

  async create(data: CreateUserInput): Promise<UserWithPasswordModel> {
    const row = await this.client.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
        image: data.image ?? null,
        isActive: true,
      },
    });
    return this.mapWithPassword(row);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      image: string | null;
      role: string;
      isActive: boolean;
      deletedAt: Date | null;
    }>
  ): Promise<UserModel> {
    const row = await this.client.user.update({
      where: { id },
      data,
    });
    return this.mapToPublic(row);
  }

  async findAll(): Promise<UserModel[]> {
    const rows = await this.client.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.mapToPublic(r));
  }

  async ensureArtistProfile(userId: string): Promise<void> {
    const existing = await this.client.artistProfile.findUnique({
      where: { userId },
    });
    if (!existing) {
      await this.client.artistProfile.create({
        data: {
          userId,
          city: "Medellín",
          category: "General",
          baseRate: 0,
          isActive: true,
        },
      });
    }
  }
}
