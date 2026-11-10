import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../../shared/errors.js";

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: err.message,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      ok: false,
      error: "Error de validación en la solicitud",
      message: formattedErrors[0]?.message || "Datos inválidos",
      code: "VALIDATION_ERROR",
      details: formattedErrors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(", ")
        : "campo único";
      return res.status(409).json({
        ok: false,
        error: `Ya existe un registro con este valor para: ${target}`,
        message: `Conflicto de unicidad en ${target}`,
        code: "UNIQUE_CONSTRAINT_VIOLATION",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        ok: false,
        error: "El recurso solicitado no fue encontrado",
        message: "Recurso no encontrado",
        code: "NOT_FOUND",
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        ok: false,
        error: "Referencia a entidad relacionada inexistente (llave foránea inválida)",
        message: "Llave foránea no válida",
        code: "FOREIGN_KEY_VIOLATION",
      });
    }

    return res.status(400).json({
      ok: false,
      error: "Error de base de datos en la solicitud",
      message: err.message,
      code: `PRISMA_${err.code}`,
    });
  }

  console.error("[Unhandled Server Error]:", err);

  return res.status(500).json({
    ok: false,
    error: "Error interno del servidor",
    message: "Ha ocurrido un error inesperado. Intente nuevamente más tarde.",
    code: "INTERNAL_SERVER_ERROR",
  });
}

