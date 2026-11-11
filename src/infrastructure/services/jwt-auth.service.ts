import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

const SALT_ROUNDS = 10;
const DEFAULT_EXPIRES_IN_SECONDS = 24 * 60 * 60; // 24 horas

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface SignedTokenResult {
  token: string;
  accessToken: string;
  expiresAt: string;
  expiresIn: number;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error("La variable de entorno JWT_SECRET es obligatoria y no está configurada");
  }
  return secret;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function signJwtToken(payload: AuthTokenPayload): SignedTokenResult {
  const secret = getJwtSecret();
  const expiresIn = DEFAULT_EXPIRES_IN_SECONDS;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const token = jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    },
    secret,
    { expiresIn }
  );

  return {
    token,
    accessToken: token,
    expiresAt,
    expiresIn,
  };
}

export function verifyJwtToken(token: string): AuthTokenPayload & JwtPayload {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Payload de token inválido");
  }
  return decoded as AuthTokenPayload & JwtPayload;
}

export function toPublicUser(rawUser: Record<string, any>): PublicUser {
  return {
    id: String(rawUser.id),
    name: String(rawUser.name ?? ""),
    email: String(rawUser.email ?? ""),
    emailVerified: Boolean(rawUser.emailVerified ?? false),
    image: rawUser.image ?? null,
    role: String(rawUser.role ?? "cliente"),
    isActive: rawUser.isActive !== undefined ? Boolean(rawUser.isActive) : true,
    createdAt: rawUser.createdAt ?? new Date().toISOString(),
    updatedAt: rawUser.updatedAt ?? new Date().toISOString(),
  };
}
