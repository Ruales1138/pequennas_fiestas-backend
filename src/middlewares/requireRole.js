export function requireRole(...allowedRoles) {
  return (req, res, next) => {
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
