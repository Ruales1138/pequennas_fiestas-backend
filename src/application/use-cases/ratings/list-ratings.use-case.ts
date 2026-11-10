import type {
  IArtistRatingRepository,
  RatingFilters,
} from "../../../domain/repository/artist-rating.repository.interface.js";
import type { ArtistRatingModel } from "../../../domain/models/artist-rating.model.js";
import {
  buildPaginatedResponse,
  parsePaginationParams,
  type PaginatedResponse,
} from "../../../shared/pagination.js";

export class ListRatingsUseCase {
  constructor(private readonly ratingRepo: IArtistRatingRepository) {}

  async execute(
    query: Record<string, unknown>
  ): Promise<PaginatedResponse<ArtistRatingModel>> {
    const { currentPage, limit, skip } = parsePaginationParams(query);

    const filters: RatingFilters = {
      artistId: typeof query.artistId === "string" ? query.artistId : undefined,
      clientId: typeof query.clientId === "string" ? query.clientId : undefined,
      minRating:
        query.minRating !== undefined && query.minRating !== ""
          ? Number(query.minRating)
          : undefined,
    };

    const { items, total } = await this.ratingRepo.findMany(filters, skip, limit);

    return buildPaginatedResponse(items, total, currentPage, limit);
  }

  async getAverageSummary(artistId: string) {
    return this.ratingRepo.getAverageRating(artistId);
  }
}

