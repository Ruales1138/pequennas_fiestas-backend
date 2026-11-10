import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1))
    .refine((val) => Number.isFinite(val) && val >= 1, {
      message: "page debe ser un número entero mayor o igual a 1",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10))
    .refine((val) => Number.isFinite(val) && val >= 1 && val <= 100, {
      message: "limit debe ser un número entero entre 1 y 100",
    }),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;

