import multer from "multer";
import { BadRequestError } from "../../shared/errors.js";

const storage = multer.memoryStorage();

export const uploadImageMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new BadRequestError("Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)"));
    }
    cb(null, true);
  },
});

