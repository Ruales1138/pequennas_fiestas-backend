import type { IStorageService } from "../../../infrastructure/services/supabase-storage.service.js";
import type { IArtistProfileRepository } from "../../../domain/repository/artist-profile.repository.interface.js";
import { BadRequestError } from "../../../shared/errors.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class UploadImageUseCase {
  constructor(
    private readonly storageService: IStorageService,
    private readonly artistRepo?: IArtistProfileRepository
  ) {}

  async execute(
    file: Express.Multer.File | undefined,
    options?: { artistId?: string; userId?: string }
  ): Promise<{ fileUrl: string }> {
    if (!file) {
      throw new BadRequestError("No se recibió ningún archivo de imagen");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestError(
        `Formato no soportado: ${file.mimetype}. Formatos permitidos: JPG, PNG, WEBP, GIF.`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError(
        `El tamaño del archivo (${(file.size / (1024 * 1024)).toFixed(2)}MB) supera el límite de 5MB.`
      );
    }

    const fileUrl = await this.storageService.uploadFile(file, "artists");

    if (this.artistRepo && (options?.artistId || options?.userId)) {
      try {
        const target = options.artistId
          ? await this.artistRepo.findById(options.artistId)
          : await this.artistRepo.findByUserId(options.userId!);

        if (target) {
          await this.artistRepo.updateImageUrl(target.id, fileUrl);
        }
      } catch (err) {
        console.warn("No se pudo asociar la imagen al artista en BD:", err);
      }
    }

    return { fileUrl };
  }
}

