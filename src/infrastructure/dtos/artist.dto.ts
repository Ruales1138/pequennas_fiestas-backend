import { z } from "zod";

export const createArtistSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  bio: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactSocial: z.string().optional().nullable(),
  baseRate: z
    .number({ invalid_type_error: "baseRate debe ser un número" })
    .min(0, "baseRate debe ser mayor o igual a 0")
    .or(
      z.string().transform((val) => {
        const parsed = Number.parseFloat(val);
        if (Number.isNaN(parsed)) throw new Error("baseRate debe ser un número válido");
        return parsed;
      })
    ),
  city: z.string().min(1, "La ciudad es obligatoria"),
  coverageArea: z.string().optional().nullable(),
  category: z.string().min(1, "La categoría es obligatoria"),
  imageUrl: z.string().url("imageUrl debe ser una URL válida").optional().nullable(),
});

export const updateArtistSchema = createArtistSchema.partial().omit({ userId: true });

export const artistFilterQuerySchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
  maxPrice: z
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

export type CreateArtistDto = z.infer<typeof createArtistSchema>;
export type UpdateArtistDto = z.infer<typeof updateArtistSchema>;
export type ArtistFilterQueryDto = z.infer<typeof artistFilterQuerySchema>;

