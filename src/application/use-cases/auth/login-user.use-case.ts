import type { IUserRepository } from "../../../domain/repository/user.repository.interface.js";
import { AppError, BadRequestError } from "../../../shared/errors.js";
import {
  comparePassword,
  signJwtToken,
  toPublicUser,
} from "../../../infrastructure/services/jwt-auth.service.js";
import type { AuthUseCaseResponse } from "./register-user.use-case.js";

const GENERIC_INVALID_CREDENTIALS_MSG = "Credenciales inválidas";

export interface LoginUserInput {
  email?: string;
  password?: string;
}

export class LoginUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: LoginUserInput): Promise<AuthUseCaseResponse> {
    const rawEmail = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
    const rawPassword = typeof input?.password === "string" ? input.password : "";

    if (!rawEmail || !rawPassword) {
      throw new BadRequestError("El correo electrónico y la contraseña son obligatorios", "MISSING_CREDENTIALS");
    }

    const user = await this.userRepo.findByEmail(rawEmail);

    if (!user || !user.password || user.isActive === false || user.deletedAt) {
      throw new AppError(GENERIC_INVALID_CREDENTIALS_MSG, 401, "INVALID_CREDENTIALS");
    }

    const passwordMatches = await comparePassword(rawPassword, user.password);
    if (!passwordMatches) {
      throw new AppError(GENERIC_INVALID_CREDENTIALS_MSG, 401, "INVALID_CREDENTIALS");
    }

    const publicUser = toPublicUser(user);
    const signed = signJwtToken({
      id: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
      name: publicUser.name,
    });

    return {
      ok: true,
      user: publicUser,
      token: signed.token,
      accessToken: signed.accessToken,
      expiresAt: signed.expiresAt,
      expiresIn: signed.expiresIn,
    };
  }
}
