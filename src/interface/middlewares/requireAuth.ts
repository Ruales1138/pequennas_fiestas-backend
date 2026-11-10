import type { NextFunction, Request, Response } from "express";
import { auth } from "../../config/auth.js";

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
