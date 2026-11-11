import type { NextFunction, Request, Response } from "express";
import { auth } from "../../config/auth.js";
import { verifyJwtToken } from "../../infrastructure/services/jwt-auth.service.js";

export interface AuthenticatedRequest extends Request {
  session?: any;
  user?: any;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const rawHeader =
      (req.headers?.authorization as string | undefined) ??
      (req.headers?.Authorization as string | undefined);

    if (typeof rawHeader === "string" && rawHeader.startsWith("Bearer ")) {
      const token = rawHeader.slice(7).trim();

      if (!token) {
        return res.status(401).json({
          ok: false,
          message: "No autorizado: token ausente",
        });
      }

      // Si el token tiene formato estándar JWT (header.payload.signature), validarlo con JWT_SECRET
      if (token.split(".").length === 3) {
        try {
          const decoded = verifyJwtToken(token);
          const userPayload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
          };
          req.user = userPayload;
          req.session = { user: userPayload };
          return next();
        } catch {
          return res.status(401).json({
            ok: false,
            message: "Token inválido o expirado",
          });
        }
      }
    }

    // Respaldo de compatibilidad con sesión BetterAuth
    const session = await auth.api.getSession({ headers: req.headers as any });

    if (!session?.user?.id) {
      return res.status(401).json({
        ok: false,
        message: "No autorizado",
      });
    }

    req.session = session;
    req.user = session.user;
    return next();
  } catch (error) {
    console.error("requireAuth error:", error);
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
}
