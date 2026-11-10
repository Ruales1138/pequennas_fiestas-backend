import { z } from "zod";

export const createRatingSchema = z.object({
  artistId: z.string().min(1, "El ID del artista es obligatorio"),
  clientId: z.string().min(1, "El ID del cliente es obligatorio"),
  rating: z
    .number({ invalid_type_error: "rating debe ser un número" })
    .min(1, "La calificación mínima es 1.0")
    .max(5, "La calificación máxima es 5.0")
    .or(
      z.string().transform((val) => {
        const parsed = Number.parseFloat(val);
        if (Number.isNaN(parsed)) throw new Error("rating debe ser un número válido");
        return parsed;
      })
    ),
  comment: z.string().optional().nullable(),
});

export const updateRatingSchema = z.object({
  rating: z
    .number()
    .min(1)
    .max(5)
    .or(z.string().transform((val) => Number.parseFloat(val)))
    .optional(),
  comment: z.string().optional().nullable(),
});

export const ratingFilterQuerySchema = z.object({
  artistId: z.string().optional(),
  clientId: z.string().optional(),
  minRating: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10)),
});

export type CreateRatingDto = z.infer<typeof createRatingSchema>;
export type UpdateRatingDto = z.infer<typeof updateRatingSchema>;
export type RatingFilterQueryDto = z.infer<typeof ratingFilterQuerySchema>;

