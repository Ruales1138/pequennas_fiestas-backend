import type { NextFunction, Request, Response } from "express";
import {
  ListRatingsUseCase,
  GetRatingByIdUseCase,
  CreateRatingUseCase,
  UpdateRatingUseCase,
  DeleteRatingUseCase,
} from "../../application/index.js";
import {
  createRatingSchema,
  updateRatingSchema,
  ratingFilterQuerySchema,
} from "../../infrastructure/dtos/rating.dto.js";

export class RatingController {
  constructor(
    private readonly listRatingsUseCase: ListRatingsUseCase,
    private readonly getRatingByIdUseCase: GetRatingByIdUseCase,
    private readonly createRatingUseCase: CreateRatingUseCase,
    private readonly updateRatingUseCase: UpdateRatingUseCase,
    private readonly deleteRatingUseCase: DeleteRatingUseCase
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ratingFilterQuerySchema.parse(req.query);
      const result = await this.listRatingsUseCase.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const rating = await this.getRatingByIdUseCase.execute(id);
      res.status(200).json({ data: rating });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createRatingSchema.parse(req.body);
      const rating = await this.createRatingUseCase.execute(validated);
      res.status(201).json({
        message: "Calificación registrada exitosamente",
        data: rating,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const validated = updateRatingSchema.parse(req.body);
      const rating = await this.updateRatingUseCase.execute(id, validated);
      res.status(200).json({
        message: "Calificación actualizada exitosamente",
        data: rating,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const rating = await this.deleteRatingUseCase.execute(id);
      res.status(200).json({
        message: "Calificación eliminada exitosamente (borrado lógico)",
        data: rating,
      });
    } catch (error) {
      next(error);
    }
  };
}
