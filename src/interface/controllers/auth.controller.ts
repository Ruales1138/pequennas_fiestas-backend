import type { NextFunction, Request, Response } from "express";
import type { IUserRepository } from "../../domain/repository/user.repository.interface.js";
import { RegisterUserUseCase } from "../../application/use-cases/auth/register-user.use-case.js";
import { LoginUserUseCase } from "../../application/use-cases/auth/login-user.use-case.js";
import {
  toPublicUser,
  verifyJwtToken,
} from "../../infrastructure/services/jwt-auth.service.js";

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader !== "string") return null;
  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly userRepo: IUserRepository
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUserUseCase.execute(req.body ?? {});
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUserUseCase.execute(req.body ?? {});
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = extractBearerToken(req);
      if (!token) {
        res.status(401).json({
          ok: false,
          message: "No autorizado",
        });
        return;
      }

      const decoded = verifyJwtToken(token);
      const user = await this.userRepo.findById(decoded.id);

      if (!user || user.isActive === false || user.deletedAt) {
        res.status(401).json({
          ok: false,
          message: "No autorizado",
        });
        return;
      }

      const publicUser = toPublicUser(user);
      res.status(200).json({
        ok: true,
        user: publicUser,
        session: {
          user: publicUser,
        },
      });
    } catch (_error) {
      res.status(401).json({
        ok: false,
        message: "Token inválido o expirado",
      });
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      ok: true,
      message: "Sesión cerrada correctamente",
    });
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractBearerToken(req);
      if (!token) {
        res.status(401).json({
          ok: false,
          message: "No autorizado",
        });
        return;
      }

      const decoded = verifyJwtToken(token);
      const { name, image } = req.body ?? {};
      const updated = await this.userRepo.update(decoded.id, {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(image !== undefined ? { image } : {}),
      });

      res.status(200).json({
        ok: true,
        user: toPublicUser(updated),
      });
    } catch (error) {
      next(error);
    }
  };
}
