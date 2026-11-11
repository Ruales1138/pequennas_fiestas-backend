import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";
import {
  ListBookingsUseCase,
  GetBookingByIdUseCase,
  CreateBookingUseCase,
  UpdateBookingUseCase,
  DeleteBookingUseCase,
} from "../../application/index.js";
import { PrismaBookingRepository } from "../../infrastructure/repository/prisma-booking.repository.js";
import { PrismaArtistProfileRepository } from "../../infrastructure/repository/prisma-artist-profile.repository.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

const bookingRepo = new PrismaBookingRepository();
const artistRepo = new PrismaArtistProfileRepository();

const listBookingsUseCase = new ListBookingsUseCase(bookingRepo);
const getBookingByIdUseCase = new GetBookingByIdUseCase(bookingRepo);
const createBookingUseCase = new CreateBookingUseCase(bookingRepo);
const updateBookingUseCase = new UpdateBookingUseCase(bookingRepo);
const deleteBookingUseCase = new DeleteBookingUseCase(bookingRepo);

const controller = new BookingController(
  listBookingsUseCase,
  getBookingByIdUseCase,
  createBookingUseCase,
  updateBookingUseCase,
  deleteBookingUseCase,
  artistRepo
);

const router = Router();

/**
 * @route   GET /api/bookings
 * @desc    Listado paginado de reservas con filtros (clientId, artistId, status)
 * @access  Protegido (requireAuth)
 */
router.get("/", requireAuth, controller.list);

/**
 * @route   GET /api/bookings/artist
 * @desc    Listado de reservas asociadas al artista autenticado
 * @access  Protegido (requireAuth / requireRole("artista", "admin"))
 */
router.get("/artist", requireAuth, requireRole("artista", "admin"), controller.listForArtist);

/**
 * @route   GET /api/bookings/:id
 * @desc    Obtener detalle de una reserva por ID
 * @access  Protegido (requireAuth)
 */
router.get("/:id", requireAuth, controller.getById);

/**
 * @route   POST /api/bookings
 * @desc    Crear una nueva reserva con validación de conflicto de horario
 * @access  Protegido (requireAuth / requireRole("cliente", "user", "admin"))
 */
router.post("/", requireAuth, requireRole("cliente", "user", "admin"), controller.create);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Actualizar estado de una reserva (aceptada / rechazada / confirmada / cancelada)
 * @access  Protegido (requireAuth / requireRole("artista", "admin"))
 */
router.patch("/:id/status", requireAuth, requireRole("artista", "admin"), controller.update);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Actualizar reserva
 * @access  Protegido (requireAuth)
 */
router.put("/:id", requireAuth, controller.update);
router.patch("/:id", requireAuth, controller.update);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Borrado lógico de reserva (isActive: false, status: "cancelada")
 * @access  Protegido (requireAuth)
 */
router.delete("/:id", requireAuth, controller.delete);

export { router as bookingRouter };

