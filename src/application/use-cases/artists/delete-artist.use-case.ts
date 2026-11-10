import type { IArtistProfileRepository } from "../../../domain/repository/artist-profile.repository.interface.js";
import type { ArtistProfileModel } from "../../../domain/models/artist-profile.model.js";
import { NotFoundError } from "../../../shared/errors.js";

export class DeleteArtistUseCase {
  constructor(private readonly artistRepo: IArtistProfileRepository) {}

  async execute(id: string): Promise<ArtistProfileModel> {
    const existing = await this.artistRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Artista con ID '${id}' no encontrado`);
    }

    return this.artistRepo.softDelete(existing.id);
  }
}

