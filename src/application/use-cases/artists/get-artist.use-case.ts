import type { IArtistProfileRepository } from "../../../domain/repository/artist-profile.repository.interface.js";
import type { ArtistProfileModel } from "../../../domain/models/artist-profile.model.js";
import { NotFoundError } from "../../../shared/errors.js";

export class GetArtistByIdUseCase {
  constructor(private readonly artistRepo: IArtistProfileRepository) {}

  async execute(id: string): Promise<ArtistProfileModel> {
    const artist = await this.artistRepo.findById(id);
    if (!artist) {
      throw new NotFoundError(`Artista con ID '${id}' no encontrado`);
    }
    return artist;
  }
}

