import type { UserModel } from "../models/user.model.js";

export interface UserWithPasswordModel extends UserModel {
  password?: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
  image?: string | null;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithPasswordModel | null>;
  findById(id: string): Promise<UserWithPasswordModel | null>;
  create(data: CreateUserInput): Promise<UserWithPasswordModel>;
  update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      image: string | null;
      role: string;
      isActive: boolean;
      deletedAt: Date | null;
    }>
  ): Promise<UserModel>;
  findAll(): Promise<UserModel[]>;
  ensureArtistProfile?(userId: string): Promise<void>;
}
