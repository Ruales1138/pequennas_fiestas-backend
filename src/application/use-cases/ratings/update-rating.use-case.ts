import type { IArtistRatingRepository } from "../../../domain/repository/artist-rating.repository.interface.js";
import type { ArtistRatingModel } from "../../../domain/models/artist-rating.model.js";
import type { UpdateRatingDto } from "../../../infrastructure/dtos/rating.dto.js";
import { NotFoundError } from "../../../shared/errors.js";

export class UpdateRatingUseCase {
  constructor(private readonly ratingRepo: IArtistRatingRepository) {}

  async execute(id: string, dto: UpdateRatingDto): Promise<ArtistRatingModel> {
    const existing = await this.ratingRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Calificación con ID '${id}' no encontrada`);
    }

    return this.ratingRepo.update(existing.id, dto);
  }
}

