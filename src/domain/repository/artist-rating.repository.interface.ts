import type { ArtistRatingModel } from "../models/artist-rating.model.js";

export interface RatingFilters {
  artistId?: string;
  clientId?: string;
  minRating?: number;
  isActive?: boolean;
}

export interface IArtistRatingRepository {
  findMany(
    filters: RatingFilters,
    skip: number,
    limit: number
  ): Promise<{ items: ArtistRatingModel[]; total: number }>;
  findById(id: string): Promise<ArtistRatingModel | null>;
  findByArtistAndClient(artistId: string, clientId: string): Promise<ArtistRatingModel | null>;
  create(data: {
    artistId: string;
    clientId: string;
    rating: number;
    comment?: string | null;
  }): Promise<ArtistRatingModel>;
  update(id: string, data: Partial<ArtistRatingModel>): Promise<ArtistRatingModel>;
  softDelete(id: string): Promise<ArtistRatingModel>;
  getAverageRating(artistId: string): Promise<{ average: number; count: number }>;
}

