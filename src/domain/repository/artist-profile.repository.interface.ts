import type { ArtistProfileModel } from "../models/artist-profile.model.js";

export interface ArtistProfileFilters {
  category?: string;
  city?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface IArtistProfileRepository {
  findMany(
    filters: ArtistProfileFilters,
    skip: number,
    limit: number
  ): Promise<{ items: ArtistProfileModel[]; total: number }>;
  findById(id: string): Promise<ArtistProfileModel | null>;
  findByUserId(userId: string): Promise<ArtistProfileModel | null>;
  create(data: {
    userId: string;
    bio?: string | null;
    contactPhone?: string | null;
    contactSocial?: string | null;
    baseRate: number;
    city: string;
    coverageArea?: string | null;
    category: string;
    imageUrl?: string | null;
  }): Promise<ArtistProfileModel>;
  update(id: string, data: Partial<ArtistProfileModel>): Promise<ArtistProfileModel>;
  softDelete(id: string): Promise<ArtistProfileModel>;
  updateImageUrl(id: string, imageUrl: string): Promise<ArtistProfileModel>;
}

