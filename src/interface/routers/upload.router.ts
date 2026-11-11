import { Router } from "express";
import { UploadController } from "../controllers/upload.controller.js";
import { uploadImageMiddleware } from "../middlewares/upload.middleware.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { UploadImageUseCase } from "../../application/index.js";
import { SupabaseStorageService } from "../../infrastructure/services/supabase-storage.service.js";
import { PrismaArtistProfileRepository } from "../../infrastructure/repository/prisma-artist-profile.repository.js";

const storageService = new SupabaseStorageService();
const artistRepo = new PrismaArtistProfileRepository();
const uploadImageUseCase = new UploadImageUseCase(storageService, artistRepo);
const controller = new UploadController(uploadImageUseCase);

const router = Router();

/**
 * =========================================================================
 * DOCUMENTACIÓN DEL ENDPOINT DE SUBIDA DE IMÁGENES (SUPABASE STORAGE / S3)
 * =========================================================================
 * @route   POST /api/upload/image
 * @desc    Sube una imagen al bucket de Supabase Storage, valida tipo y tamaño,
 *          guarda la URL en la base de datos (si se especifica artistId o userId)
 *          y retorna { message, fileUrl }.
 * @headers Content-Type: multipart/form-data
 * @body    - image (archivo binario, JPG/PNG/WEBP/GIF, máx 5MB)
 *          - artistId (opcional): ID del artista para asociar la URL en BD
 *          - userId (opcional): ID del usuario para asociar la URL en BD
 * @response 201: { message: string, fileUrl: string }
 * @response 400: Error de validación de formato o tamaño
 * =========================================================================
 */
router.post(
  "/image",
  requireAuth,
  requireRole("artista", "cliente", "user", "admin"),
  uploadImageMiddleware.single("image"),
  controller.uploadImage
);

export { router as uploadRouter };

