import type { IArtistRatingRepository } from "../../../domain/repository/artist-rating.repository.interface.js";
import type { ArtistRatingModel } from "../../../domain/models/artist-rating.model.js";
import type { CreateRatingDto } from "../../../infrastructure/dtos/rating.dto.js";
import { BadRequestError, ConflictError } from "../../../shared/errors.js";

export class CreateRatingUseCase {
  constructor(private readonly ratingRepo: IArtistRatingRepository) {}

  async execute(dto: CreateRatingDto): Promise<ArtistRatingModel> {
    if (dto.clientId === dto.artistId) {
      throw new BadRequestError("No puedes calificarte a ti mismo");
    }

    const existing = await this.ratingRepo.findByArtistAndClient(
      dto.artistId,
      dto.clientId
    );

    if (existing) {
      throw new ConflictError("Ya has calificado a este artista anteriormente");
    }

    return this.ratingRepo.create({
      artistId: dto.artistId,
      clientId: dto.clientId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
  }
}

