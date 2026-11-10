import { Router } from "express";
import { RatingController } from "../controllers/rating.controller.js";
import {
  ListRatingsUseCase,
  GetRatingByIdUseCase,
  CreateRatingUseCase,
  UpdateRatingUseCase,
  DeleteRatingUseCase,
} from "../../application/index.js";
import { PrismaArtistRatingRepository } from "../../infrastructure/repository/prisma-artist-rating.repository.js";

const ratingRepo = new PrismaArtistRatingRepository();

const listRatingsUseCase = new ListRatingsUseCase(ratingRepo);
const getRatingByIdUseCase = new GetRatingByIdUseCase(ratingRepo);
const createRatingUseCase = new CreateRatingUseCase(ratingRepo);
const updateRatingUseCase = new UpdateRatingUseCase(ratingRepo);
const deleteRatingUseCase = new DeleteRatingUseCase(ratingRepo);

const controller = new RatingController(
  listRatingsUseCase,
  getRatingByIdUseCase,
  createRatingUseCase,
  updateRatingUseCase,
  deleteRatingUseCase
);

const router = Router();

/**
 * @route   GET /api/ratings
 * @desc    Listado paginado de calificaciones con filtros (artistId, clientId, minRating)
 * @access  Público
 */
router.get("/", controller.list);

/**
 * @route   GET /api/ratings/:id
 * @desc    Obtener calificación por ID
 * @access  Público
 */
router.get("/:id", controller.getById);

/**
 * @route   POST /api/ratings
 * @desc    Registrar una calificación para un artista
 * @access  Protegido (Buri: aplicar requireAuth / requireRole("cliente"))
 */
router.post("/", controller.create);

/**
 * @route   PUT /api/ratings/:id
 * @desc    Actualizar calificación existente
 * @access  Protegido (Buri: aplicar requireAuth)
 */
router.put("/:id", controller.update);
router.patch("/:id", controller.update);

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Borrado lógico de calificación (isActive: false)
 * @access  Protegido (Buri: aplicar requireAuth / requireRole("admin"))
 */
router.delete("/:id", controller.delete);

export { router as ratingRouter };

