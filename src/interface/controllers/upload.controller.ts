import type { NextFunction, Request, Response } from "express";
import { UploadImageUseCase } from "../../application/index.js";

export class UploadController {
  constructor(private readonly uploadImageUseCase: UploadImageUseCase) {}

  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const artistId = (req.body?.artistId || req.query?.artistId) as string | undefined;
      const userId = (req.body?.userId || req.query?.userId) as string | undefined;

      const result = await this.uploadImageUseCase.execute(req.file, {
        artistId,
        userId,
      });

      res.status(201).json({
        message: "Imagen subida exitosamente a Supabase Storage",
        fileUrl: result.fileUrl,
      });
    } catch (error) {
      next(error);
    }
  };
}

