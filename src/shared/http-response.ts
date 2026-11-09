import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors.js";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string): Response {
  const payload: Record<string, unknown> = { data };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
}

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    const responseBody: Record<string, unknown> = {
      ok: false,
      message: err.message,
      error: err.message,
      code: err.code,
    };
    if (err.details !== undefined) {
      responseBody.details = err.details;
    }
    return res.status(err.statusCode).json(responseBody);
  }

  const fallbackMessage =
    err instanceof Error && err.message ? err.message : "Error interno del servidor";

  console.error("[Unhandled Error]:", err);

  return res.status(500).json({
    ok: false,
    message: fallbackMessage,
    error: fallbackMessage,
    code: "INTERNAL_SERVER_ERROR",
  });
}

