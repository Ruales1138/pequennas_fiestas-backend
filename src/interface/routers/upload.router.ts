import { Router } from "express";
import { UploadController } from "../controllers/upload.controller.js";
import { uploadImageMiddleware } from "../middlewares/upload.middleware.js";
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
 *
 * NOTA PARA BURI (Autenticación y Roles):
 * Aquí se debe conectar el middleware `requireAuth` para asegurar que solo
 * usuarios autenticados puedan subir fotos, o `requireRole("artista", "admin")`
 * según las políticas definidas en el proyecto.
 * =========================================================================
 */
router.post(
  "/image",
  // NOTA PARA BURI: insertar requireAuth aquí (e.g. requireAuth, uploadImageMiddleware.single("image"), ...)
  uploadImageMiddleware.single("image"),
  controller.uploadImage
);

export { router as uploadRouter };

