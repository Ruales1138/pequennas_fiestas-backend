import { auth } from "../config/auth.js";

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

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
