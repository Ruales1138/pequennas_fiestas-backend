import type {
  ArtistProfileFilters,
  IArtistProfileRepository,
} from "../../../domain/repository/artist-profile.repository.interface.js";
import type { ArtistProfileModel } from "../../../domain/models/artist-profile.model.js";
import {
  buildPaginatedResponse,
  parsePaginationParams,
  type PaginatedResponse,
} from "../../../shared/pagination.js";

export class ListArtistsUseCase {
  constructor(private readonly artistRepo: IArtistProfileRepository) {}

  async execute(
    query: Record<string, unknown>
  ): Promise<PaginatedResponse<ArtistProfileModel>> {
    const { currentPage, limit, skip } = parsePaginationParams(query);

    const filters: ArtistProfileFilters = {
      category: typeof query.category === "string" ? query.category : undefined,
      city: typeof query.city === "string" ? query.city : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
      minPrice:
        query.minPrice !== undefined && query.minPrice !== ""
          ? Number(query.minPrice)
          : undefined,
      maxPrice:
        query.maxPrice !== undefined && query.maxPrice !== ""
          ? Number(query.maxPrice)
          : undefined,
    };

    const { items, total } = await this.artistRepo.findMany(filters, skip, limit);

    return buildPaginatedResponse(items, total, currentPage, limit);
  }
}

