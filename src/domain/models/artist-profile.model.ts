import type { UserModel } from "./user.model.js";

export interface ArtistProfileModel {
  id: string;
  userId: string;
  bio?: string | null;
  contactPhone?: string | null;
  contactSocial?: string | null;
  baseRate: number;
  city: string;
  coverageArea?: string | null;
  category: string;
  imageUrl?: string | null;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: UserModel;
}

