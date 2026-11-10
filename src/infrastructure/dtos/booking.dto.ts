import { z } from "zod";

export const createBookingSchema = z.object({
  clientId: z.string().min(1, "El ID del cliente es obligatorio"),
  artistId: z.string().min(1, "El ID del artista es obligatorio"),
  eventDate: z
    .string()
    .datetime({ message: "eventDate debe ser una fecha ISO válida" })
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => date.getTime() > Date.now(), {
      message: "La fecha del evento debe ser posterior a la fecha actual",
    }),
  eventLocation: z.string().min(1, "La ubicación del evento es obligatoria"),
  description: z.string().optional().nullable(),
  jobHours: z
    .number({ invalid_type_error: "jobHours debe ser un número" })
    .min(0.5, "Las horas deben ser al menos 0.5")
    .max(24, "Las horas no pueden exceder 24")
    .or(
      z.string().transform((val) => {
        const parsed = Number.parseFloat(val);
        if (Number.isNaN(parsed)) throw new Error("jobHours debe ser un número válido");
        return parsed;
      })
    ),
  agreedPrice: z
    .number({ invalid_type_error: "agreedPrice debe ser un número" })
    .min(0, "agreedPrice debe ser mayor o igual a 0")
    .or(
      z.string().transform((val) => {
        const parsed = Number.parseFloat(val);
        if (Number.isNaN(parsed)) throw new Error("agreedPrice debe ser un número válido");
        return parsed;
      })
    ),
  status: z
    .enum(["pendiente", "confirmada", "cancelada", "completada"])
    .optional()
    .default("pendiente"),
});

export const updateBookingSchema = z.object({
  eventDate: z
    .string()
    .datetime({ message: "eventDate debe ser una fecha ISO válida" })
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  eventLocation: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  jobHours: z
    .number()
    .min(0.5)
    .max(24)
    .or(z.string().transform((v) => Number.parseFloat(v)))
    .optional(),
  agreedPrice: z
    .number()
    .min(0)
    .or(z.string().transform((v) => Number.parseFloat(v)))
    .optional(),
  status: z.enum(["pendiente", "confirmada", "cancelada", "completada"]).optional(),
});

export const bookingFilterQuerySchema = z.object({
  clientId: z.string().optional(),
  artistId: z.string().optional(),
  status: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10)),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type UpdateBookingDto = z.infer<typeof updateBookingSchema>;
export type BookingFilterQueryDto = z.infer<typeof bookingFilterQuerySchema>;

