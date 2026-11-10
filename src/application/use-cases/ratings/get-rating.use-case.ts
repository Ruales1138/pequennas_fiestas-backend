import type { IArtistRatingRepository } from "../../../domain/repository/artist-rating.repository.interface.js";
import type { ArtistRatingModel } from "../../../domain/models/artist-rating.model.js";
import { NotFoundError } from "../../../shared/errors.js";

export class GetRatingByIdUseCase {
  constructor(private readonly ratingRepo: IArtistRatingRepository) {}

  async execute(id: string): Promise<ArtistRatingModel> {
    const rating = await this.ratingRepo.findById(id);
    if (!rating) {
      throw new NotFoundError(`Calificación con ID '${id}' no encontrada`);
    }
    return rating;
  }
}

