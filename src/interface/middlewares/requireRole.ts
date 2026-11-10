import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./requireAuth.js";

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    const userRole = req.user?.role ?? req.session?.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para acceder a esta sección",
      });
    }

    return next();
  };
}
