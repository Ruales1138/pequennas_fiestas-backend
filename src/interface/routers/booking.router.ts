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

const bookingRepo = new PrismaBookingRepository();

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
  deleteBookingUseCase
);

const router = Router();

/**
 * @route   GET /api/bookings
 * @desc    Listado paginado de reservas con filtros (clientId, artistId, status)
 * @access  Protegido (Buri: aplicar requireAuth)
 */
router.get("/", controller.list);

/**
 * @route   GET /api/bookings/:id
 * @desc    Obtener detalle de una reserva por ID
 * @access  Protegido (Buri: aplicar requireAuth)
 */
router.get("/:id", controller.getById);

/**
 * @route   POST /api/bookings
 * @desc    Crear una nueva reserva con validación de conflicto de horario
 * @access  Protegido (Buri: aplicar requireAuth)
 */
router.post("/", controller.create);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Actualizar reserva
 * @access  Protegido (Buri: aplicar requireAuth)
 */
router.put("/:id", controller.update);
router.patch("/:id", controller.update);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Borrado lógico de reserva (isActive: false, status: "cancelada")
 * @access  Protegido (Buri: aplicar requireAuth)
 */
router.delete("/:id", controller.delete);

export { router as bookingRouter };

