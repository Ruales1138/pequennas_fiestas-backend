import "dotenv/config";
import { prisma } from "../src/infrastructure/prisma/prisma.client.js";
import { seedDatabase } from "../src/infrastructure/prisma/seed.js";

async function main() {
  console.log("Ejecutando seed de base de datos con Prisma...");
  const result = await seedDatabase(prisma);
  console.log("Usuarios creados/actualizados exitosamente:");
  console.log(" - Admin:", result.admin.email, `(${result.admin.role})`);
  console.log(" - User:", result.user.email, `(${result.user.role})`);
  console.log(" - Cliente:", result.cliente.email, `(${result.cliente.role})`);
  console.log(" - Artista:", result.artista.email, `(${result.artista.role})`);
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
