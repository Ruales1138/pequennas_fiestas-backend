import type { IArtistProfileRepository } from "../../../domain/repository/artist-profile.repository.interface.js";
import type { ArtistProfileModel } from "../../../domain/models/artist-profile.model.js";
import type { CreateArtistDto } from "../../../infrastructure/dtos/artist.dto.js";

export class CreateArtistUseCase {
  constructor(private readonly artistRepo: IArtistProfileRepository) {}

  async execute(dto: CreateArtistDto): Promise<ArtistProfileModel> {
    const existing = await this.artistRepo.findByUserId(dto.userId);
    if (existing) {
      return this.artistRepo.update(existing.id, {
        bio: dto.bio ?? existing.bio,
        contactPhone: dto.contactPhone ?? existing.contactPhone,
        contactSocial: dto.contactSocial ?? existing.contactSocial,
        baseRate: dto.baseRate,
        city: dto.city,
        coverageArea: dto.coverageArea ?? existing.coverageArea,
        category: dto.category,
        ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}),
        isActive: true,
        deletedAt: null,
      });
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

