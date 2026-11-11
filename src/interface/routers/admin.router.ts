import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

export const adminRouter = Router();
const controller = new AdminController();

adminRouter.use(requireAuth);
adminRouter.use(requireRole("admin"));

// Gestión administrativa y auditoría de usuarios
adminRouter.get("/users", controller.listUsers);
adminRouter.patch("/users/:id/status", controller.updateUserStatus);
adminRouter.delete("/users/:id", controller.deleteUser);

// Gestión administrativa y auditoría de artistas
adminRouter.get("/artists", controller.listArtists);
adminRouter.patch("/artists/:id/status", controller.updateArtistStatus);
adminRouter.delete("/artists/:id", controller.deleteArtist);

// Gestión administrativa y auditoría de reservas
adminRouter.get("/bookings", controller.listBookings);
adminRouter.patch("/bookings/:id/status", controller.updateBookingStatus);
adminRouter.delete("/bookings/:id", controller.deleteBooking);

// Gestión administrativa y auditoría de calificaciones
adminRouter.get("/ratings", controller.listRatings);
adminRouter.patch("/ratings/:id/status", controller.updateRatingStatus);
adminRouter.delete("/ratings/:id", controller.deleteRating);
