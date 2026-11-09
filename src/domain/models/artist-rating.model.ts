import type { UserModel } from "./user.model.js";

export interface ArtistRatingModel {
  id: string;
  artistId: string;
  clientId: string;
  rating: number;
  comment?: string | null;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client?: UserModel;
  artist?: UserModel;
}

