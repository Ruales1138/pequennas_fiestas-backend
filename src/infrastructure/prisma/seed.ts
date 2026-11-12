import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "./prisma.client.js";
import { hashPassword, toPublicUser } from "../services/jwt-auth.service.js";

export const SEED_USERS = {
  admin: {
    name: "Administrador Pequeñas Fiestas",
    email: "admin@pequennasfiestas.com",
    password: "Admin123!",
    role: "admin",
  },
  user: {
    name: "Usuario Estándar Pequeñas Fiestas",
    email: "user@pequennasfiestas.com",
    password: "User123!",
    role: "user",
  },
  cliente: {
    name: "Cliente Demo Pequeñas Fiestas",
    email: "cliente@pequennasfiestas.com",
    password: "Cliente123!",
    role: "cliente",
  },
  artista: {
    name: "Banda Fiesta Show",
    email: "artista@pequennasfiestas.com",
    password: "Artista123!",
    role: "artista",
  },
} as const;

const EXTRA_ARTISTS = [
  {
    name: "DJ Pequeño Beat",
    email: "djbeat@pequennasfiestas.com",
    password: "Artista123!",
    profile: {
      bio: "DJ profesional especializado en fiestas corporativas, quinceañeros y bodas. Mezcla en vivo de reggaetón, electrónica y crossover.",
      contactPhone: "+57 311 456 7890",
      contactSocial: "@djpequenobeat",
      baseRate: 450000,
      city: "Bogotá",
      coverageArea: "Bogotá y Cundinamarca",
      category: "DJ",
      imageUrl: "/images/artists/dj_beat.jpg",
    },
  },
  {
    name: "Magia con Andrés",
    email: "magia.andres@pequennasfiestas.com",
    password: "Artista123!",
    profile: {
      bio: "Mago profesional con más de 10 años de experiencia. Shows de magia cercana, ilusionismo de escenario y mentalismo para todo tipo de evento.",
      contactPhone: "+57 320 789 1234",
      contactSocial: "@magiaconandres",
      baseRate: 280000,
      city: "Cali",
      coverageArea: "Valle del Cauca",
      category: "Magia",
      imageUrl: "/images/artists/magia_andres.jpg",
    },
  },
  {
    name: "Payasito Risas",
    email: "payasitorisas@pequennasfiestas.com",
    password: "Artista123!",
    profile: {
      bio: "Animador y payaso profesional para fiestas infantiles. Shows con globoflexia, pintacaritas, juegos interactivos y mucha diversión garantizada.",
      contactPhone: "+57 315 234 5678",
      contactSocial: "@payasitorisas",
      baseRate: 200000,
      city: "Medellín",
      coverageArea: "Área Metropolitana de Medellín",
      category: "Animación",
      imageUrl: "/images/artists/payasito_risas.jpg",
    },
  },
  {
    name: "Dúo Acrobático Stellar",
    email: "stellar@pequennasfiestas.com",
    password: "Artista123!",
    profile: {
      bio: "Dúo acrobático profesional con espectáculos de tela aérea, trapecio y acrobacias de piso. Ideal para galas, circos y eventos VIP.",
      contactPhone: "+57 318 567 8901",
      contactSocial: "@duostellar",
      baseRate: 600000,
      city: "Barranquilla",
      coverageArea: "Costa Atlántica",
      category: "Acrobacia",
      imageUrl: "/images/artists/stellar.jpg",
    },
  },
  {
    name: "Comedia en Vivo - Carlos P.",
    email: "comediacarlos@pequennasfiestas.com",
    password: "Artista123!",
    profile: {
      bio: "Comediante de stand-up con shows personalizados para empresas y celebraciones privadas. Humor inteligente y apto para todas las audiencias.",
      contactPhone: "+57 322 890 1234",
      contactSocial: "@comediacarlosp",
      baseRate: 380000,
      city: "Bogotá",
      coverageArea: "Nacional",
      category: "Comedia",
      imageUrl: "/images/artists/comedia_carlos.jpg",
    },
  },
] as const;

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
        imageUrl: "/images/artists/artista_principal.jpg",
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
        imageUrl: "/images/artists/artista_principal.jpg",
        isActive: true,
      },
    });

    // Seed extra artists
    for (const extra of EXTRA_ARTISTS) {
      const hash = await hashPassword(extra.password);
      const extraUser = await client.user.upsert({
        where: { email: extra.email },
        update: {
          name: extra.name,
          password: hash,
          role: "artista",
          emailVerified: true,
          isActive: true,
          deletedAt: null,
        },
        create: {
          name: extra.name,
          email: extra.email,
          password: hash,
          role: "artista",
          emailVerified: true,
          isActive: true,
        },
      });

      await client.artistProfile.upsert({
        where: { userId: extraUser.id },
        update: {
          bio: extra.profile.bio,
          contactPhone: extra.profile.contactPhone,
          contactSocial: extra.profile.contactSocial,
          baseRate: new Prisma.Decimal(extra.profile.baseRate),
          city: extra.profile.city,
          coverageArea: extra.profile.coverageArea,
          category: extra.profile.category,
          imageUrl: extra.profile.imageUrl,
          isActive: true,
          deletedAt: null,
        },
        create: {
          userId: extraUser.id,
          bio: extra.profile.bio,
          contactPhone: extra.profile.contactPhone,
          contactSocial: extra.profile.contactSocial,
          baseRate: new Prisma.Decimal(extra.profile.baseRate),
          city: extra.profile.city,
          coverageArea: extra.profile.coverageArea,
          category: extra.profile.category,
          imageUrl: extra.profile.imageUrl,
          isActive: true,
        },
      });
    }
  }

  return {
    admin: toPublicUser(admin),
    user: toPublicUser(user),
    cliente: toPublicUser(cliente),
    artista: toPublicUser(artista),
  };
}
