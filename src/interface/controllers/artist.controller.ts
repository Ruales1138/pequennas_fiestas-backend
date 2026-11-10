import type { NextFunction, Request, Response } from "express";
import {
  ListArtistsUseCase,
  GetArtistByIdUseCase,
  CreateArtistUseCase,
  UpdateArtistUseCase,
  DeleteArtistUseCase,
} from "../../application/index.js";
import {
  createArtistSchema,
  updateArtistSchema,
  artistFilterQuerySchema,
} from "../../infrastructure/dtos/artist.dto.js";
import { PrismaArtistRatingRepository } from "../../infrastructure/repository/prisma-artist-rating.repository.js";

export class ArtistController {
  constructor(
    private readonly listArtistsUseCase: ListArtistsUseCase,
    private readonly getArtistByIdUseCase: GetArtistByIdUseCase,
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly updateArtistUseCase: UpdateArtistUseCase,
    private readonly deleteArtistUseCase: DeleteArtistUseCase,
    private readonly ratingRepo?: PrismaArtistRatingRepository
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      artistFilterQuerySchema.parse(req.query);
      const result = await this.listArtistsUseCase.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const artist = await this.getArtistByIdUseCase.execute(id);
      res.status(200).json({ data: artist });
    } catch (error) {
      next(error);
    }
  };

  getRatings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const artist = await this.getArtistByIdUseCase.execute(id);
      const ratingRepo = this.ratingRepo ?? new PrismaArtistRatingRepository();
      const ratings = await ratingRepo.findMany({ artistId: artist.userId }, 0, 50);
      const summary = await ratingRepo.getAverageRating(artist.userId);

      res.status(200).json({
        data: ratings.items,
        meta: {
          rating: summary.average,
          ratingCount: summary.count,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createArtistSchema.parse(req.body);
      const artist = await this.createArtistUseCase.execute(validated);
      res.status(201).json({
        message: "Perfil de artista creado exitosamente",
        data: artist,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const validated = updateArtistSchema.parse(req.body);
      const artist = await this.updateArtistUseCase.execute(id, validated);
      res.status(200).json({
        message: "Perfil de artista actualizado exitosamente",
        data: artist,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const artist = await this.deleteArtistUseCase.execute(id);
      res.status(200).json({
        message: "Perfil de artista desactivado exitosamente (borrado lógico)",
        data: artist,
      });
    } catch (error) {
      next(error);
    }
  };
}
