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
 * @route   POST /api/artists
 * @desc    Crear un nuevo perfil de artista
 * @access  Protegido (Buri: aplicar requireAuth / requireRole("admin", "artista"))
 */
router.post("/", controller.create);

/**
 * @route   PUT /api/artists/:id
 * @desc    Actualizar perfil de artista
 * @access  Protegido (Buri: aplicar requireAuth)
 */
router.put("/:id", controller.update);
router.patch("/:id", controller.update);

/**
 * @route   DELETE /api/artists/:id
 * @desc    Borrado lógico de artista (isActive: false)
 * @access  Protegido (Buri: aplicar requireAuth / requireRole("admin"))
 */
router.delete("/:id", controller.delete);

export { router as artistRouter };

