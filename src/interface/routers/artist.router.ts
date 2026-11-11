import { Router } from "express";
import { ArtistController } from "../controllers/artist.controller.js";
import {
  ListArtistsUseCase,
  GetArtistByIdUseCase,
  CreateArtistUseCase,
  UpdateArtistUseCase,
  DeleteArtistUseCase,
} from "../../application/index.js";
import { PrismaArtistProfileRepository } from "../../infrastructure/repository/prisma-artist-profile.repository.js";
import { PrismaArtistRatingRepository } from "../../infrastructure/repository/prisma-artist-rating.repository.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

const artistRepo = new PrismaArtistProfileRepository();
const ratingRepo = new PrismaArtistRatingRepository();

const listArtistsUseCase = new ListArtistsUseCase(artistRepo);
const getArtistByIdUseCase = new GetArtistByIdUseCase(artistRepo);
const createArtistUseCase = new CreateArtistUseCase(artistRepo);
const updateArtistUseCase = new UpdateArtistUseCase(artistRepo);
const deleteArtistUseCase = new DeleteArtistUseCase(artistRepo);

const controller = new ArtistController(
  listArtistsUseCase,
  getArtistByIdUseCase,
  createArtistUseCase,
  updateArtistUseCase,
  deleteArtistUseCase,
  ratingRepo
);

const router = Router();

/**
 * @route   GET /api/artists
 * @desc    Listado paginado de artistas con filtros (categoría, ciudad, precio, búsqueda)
 * @access  Público
 */
router.get("/", controller.list);

/**
 * @route   GET /api/artists/:id
 * @desc    Obtener artista por ID
 * @access  Público
 */
router.get("/:id", controller.getById);

/**
 * @route   GET /api/artists/:id/ratings
 * @desc    Obtener calificaciones y promedio de un artista (compatibilidad frontend)
 * @access  Público
 */
router.get("/:id/ratings", controller.getRatings);

/**
 * @route   POST /api/artists/:id/ratings
 * @desc    Registrar calificación de un artista autenticado
 * @access  Protegido (requireAuth / requireRole("cliente", "user", "admin"))
 */
router.post(
  "/:id/ratings",
  requireAuth,
  requireRole("cliente", "user", "admin"),
  controller.createRating
);

/**
 * @route   POST /api/artists
 * @desc    Crear un nuevo perfil de artista
 * @access  Protegido (requireAuth / requireRole("admin", "artista"))
 */
router.post("/", requireAuth, requireRole("artista", "admin"), controller.create);

/**
 * @route   PUT /api/artists/:id
 * @desc    Actualizar perfil de artista
 * @access  Protegido (requireAuth / requireRole("admin", "artista"))
 */
router.put("/:id", requireAuth, requireRole("artista", "admin"), controller.update);
router.patch("/:id", requireAuth, requireRole("artista", "admin"), controller.update);

/**
 * @route   DELETE /api/artists/:id
 * @desc    Borrado lógico de artista (isActive: false)
 * @access  Protegido (requireAuth / requireRole("admin"))
 */
router.delete("/:id", requireAuth, requireRole("admin"), controller.delete);

export { router as artistRouter };

