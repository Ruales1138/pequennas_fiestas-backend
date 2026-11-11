import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "./prisma.client.js";
import { hashPassword, toPublicUser } from "../services/jwt-auth.service.js";

export const SEED_USERS = {
  admin: {
    name: "Administrador GigaShow",
    email: "admin@gigashow.com",
    password: "Admin123!",
    role: "admin",
  },
  user: {
    name: "Usuario Estándar GigaShow",
    email: "user@gigashow.com",
    password: "User123!",
    role: "user",
  },
  cliente: {
    name: "Cliente Demo GigaShow",
    email: "cliente@gigashow.com",
    password: "Cliente123!",
    role: "cliente",
  },
  artista: {
    name: "Banda Fiesta Show",
    email: "artista@gigashow.com",
    password: "Artista123!",
    role: "artista",
  },
} as const;

export async function seedDatabase(client: PrismaClient = prisma) {
  const [adminHash, userHash, clienteHash, artistaHash] = await Promise.all([
    hashPassword(SEED_USERS.admin.password),
    hashPassword(SEED_USERS.user.password),
    hashPassword(SEED_USERS.cliente.password),
    hashPassword(SEED_USERS.artista.password),
  ]);

  const admin = await client.user.upsert({
    where: { email: SEED_USERS.admin.email },
    update: {
      name: SEED_USERS.admin.name,
      password: adminHash,
      role: "admin",
      emailVerified: true,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: SEED_USERS.admin.name,
      email: SEED_USERS.admin.email,
      password: adminHash,
      role: "admin",
      emailVerified: true,
      isActive: true,
    },
  });

  const user = await client.user.upsert({
    where: { email: SEED_USERS.user.email },
    update: {
      name: SEED_USERS.user.name,
      password: userHash,
      role: "user",
      emailVerified: true,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: SEED_USERS.user.name,
      email: SEED_USERS.user.email,
      password: userHash,
      role: "user",
      emailVerified: true,
      isActive: true,
    },
  });

  const cliente = await client.user.upsert({
    where: { email: SEED_USERS.cliente.email },
    update: {
      name: SEED_USERS.cliente.name,
      password: clienteHash,
      role: "cliente",
      emailVerified: true,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: SEED_USERS.cliente.name,
      email: SEED_USERS.cliente.email,
      password: clienteHash,
      role: "cliente",
      emailVerified: true,
      isActive: true,
    },
  });

  const artista = await client.user.upsert({
    where: { email: SEED_USERS.artista.email },
    update: {
      name: SEED_USERS.artista.name,
      password: artistaHash,
      role: "artista",
      emailVerified: true,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: SEED_USERS.artista.name,
      email: SEED_USERS.artista.email,
      password: artistaHash,
      role: "artista",
      emailVerified: true,
      isActive: true,
    },
  });

  if (client.artistProfile?.upsert) {
    await client.artistProfile.upsert({
      where: { userId: artista.id },
      update: {
        bio: "Agrupación musical y animación en vivo para fiestas y eventos corporativos.",
        contactPhone: "+57 300 123 4567",
        contactSocial: "@bandafiestashow",
        baseRate: new Prisma.Decimal(350000),
        city: "Medellín",
        coverageArea: "Valle de Aburrá y Oriente Antioqueño",
        category: "Música",
        isActive: true,
        deletedAt: null,
      },
      create: {
        userId: artista.id,
        bio: "Agrupación musical y animación en vivo para fiestas y eventos corporativos.",
        contactPhone: "+57 300 123 4567",
        contactSocial: "@bandafiestashow",
        baseRate: new Prisma.Decimal(350000),
        city: "Medellín",
        coverageArea: "Valle de Aburrá y Oriente Antioqueño",
        category: "Música",
        isActive: true,
      },
    });
  }

  return {
    admin: toPublicUser(admin),
    user: toPublicUser(user),
    cliente: toPublicUser(cliente),
    artista: toPublicUser(artista),
  };
}
