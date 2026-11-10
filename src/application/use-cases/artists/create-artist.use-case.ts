import type { IArtistProfileRepository } from "../../../domain/repository/artist-profile.repository.interface.js";
import type { ArtistProfileModel } from "../../../domain/models/artist-profile.model.js";
import type { CreateArtistDto } from "../../../infrastructure/dtos/artist.dto.js";
import { ConflictError } from "../../../shared/errors.js";

export class CreateArtistUseCase {
  constructor(private readonly artistRepo: IArtistProfileRepository) {}

  async execute(dto: CreateArtistDto): Promise<ArtistProfileModel> {
    const existing = await this.artistRepo.findByUserId(dto.userId);
    if (existing) {
      throw new ConflictError(`El usuario con ID '${dto.userId}' ya tiene un perfil de artista registrado`);
    }

    return this.artistRepo.create({
      userId: dto.userId,
      bio: dto.bio ?? null,
      contactPhone: dto.contactPhone ?? null,
      contactSocial: dto.contactSocial ?? null,
      baseRate: dto.baseRate,
      city: dto.city,
      coverageArea: dto.coverageArea ?? null,
      category: dto.category,
      imageUrl: dto.imageUrl ?? null,
    });
  }
}

