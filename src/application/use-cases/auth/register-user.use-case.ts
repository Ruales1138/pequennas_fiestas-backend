import type { IUserRepository } from "../../../domain/repository/user.repository.interface.js";
import { BadRequestError, ConflictError } from "../../../shared/errors.js";
import {
  hashPassword,
  signJwtToken,
  toPublicUser,
  type PublicUser,
} from "../../../infrastructure/services/jwt-auth.service.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_REGISTER_ROLES = new Set(["cliente", "artista", "user"]);

export interface RegisterUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  image?: string | null;
}

export interface AuthUseCaseResponse {
  ok: true;
  user: PublicUser;
  token: string;
  accessToken: string;
  expiresAt: string;
  expiresIn: number;
}

export class RegisterUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<AuthUseCaseResponse> {
    const rawName = typeof input?.name === "string" ? input.name.trim() : "";
    const rawEmail = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
    const rawPassword = typeof input?.password === "string" ? input.password : "";
    const requestedRole =
      typeof input?.role === "string" && input.role.trim() !== ""
        ? input.role.trim().toLowerCase()
        : "cliente";

    if (!rawName || rawName.length < 2) {
      throw new BadRequestError("El nombre es obligatorio y debe tener al menos 2 caracteres", "INVALID_NAME");
    }

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
      throw new BadRequestError("El formato del correo electrónico no es válido", "INVALID_EMAIL");
    }

    if (!rawPassword || rawPassword.length < 6) {
      throw new BadRequestError("La contraseña es obligatoria y debe tener al menos 6 caracteres", "INVALID_PASSWORD");
    }

    if (requestedRole === "admin") {
      throw new BadRequestError(
        "No está permitido registrarse con el rol de administrador",
        "FORBIDDEN_ADMIN_ROLE"
      );
    }

    if (!ALLOWED_REGISTER_ROLES.has(requestedRole)) {
      throw new BadRequestError("El rol seleccionado no es válido", "INVALID_ROLE");
    }

    const existingUser = await this.userRepo.findByEmail(rawEmail);
    if (existingUser) {
      throw new ConflictError("El correo electrónico ya está registrado", "EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hashPassword(rawPassword);

    const createdUser = await this.userRepo.create({
      name: rawName,
      email: rawEmail,
      password: passwordHash,
      role: requestedRole,
      image: input?.image ?? null,
    });

    if (requestedRole === "artista" && this.userRepo.ensureArtistProfile) {
      await this.userRepo.ensureArtistProfile(createdUser.id);
    }

    const publicUser = toPublicUser(createdUser);
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
