import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./requireAuth.js";

export function requireRole(...allowedRoles: Array<string | string[]>) {
  const normalizedAllowed = allowedRoles
    .flat()
    .map((role) => String(role).trim().toLowerCase())
    .filter(Boolean);

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    const rawRole = req.user?.role ?? req.session?.user?.role;
    const userRole = typeof rawRole === "string" ? rawRole.trim().toLowerCase() : "";

    if (!userRole || !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para acceder a esta sección",
      });
    }

    return next();
  };
}
