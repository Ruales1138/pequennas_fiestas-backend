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
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

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
 * @access  Protegido (requireAuth / requireRole("cliente", "user", "admin"))
 */
router.post("/", requireAuth, requireRole("cliente", "user", "admin"), controller.create);

/**
 * @route   PUT /api/ratings/:id
 * @desc    Actualizar calificación existente
 * @access  Protegido (requireAuth)
 */
router.put("/:id", requireAuth, controller.update);
router.patch("/:id", requireAuth, controller.update);

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Borrado lógico de calificación (isActive: false)
 * @access  Protegido (requireAuth / requireRole("admin"))
 */
router.delete("/:id", requireAuth, requireRole("admin"), controller.delete);

export { router as ratingRouter };

