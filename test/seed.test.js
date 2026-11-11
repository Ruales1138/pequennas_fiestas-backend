import assert from "node:assert/strict";
import test from "node:test";

import { seedDatabase, SEED_USERS } from "../dist/infrastructure/prisma/seed.js";
import { comparePassword } from "../dist/infrastructure/services/jwt-auth.service.js";

test("seedDatabase creates admin and user accounts with bcrypt hashed passwords and hides hashes in output", async () => {
  const storedUsers = new Map();
  const storedProfiles = new Map();
  let counter = 1;

  const mockPrisma = {
    user: {
      async upsert({ where, update, create }) {
        const existing = storedUsers.get(where.email);
        const record = existing
          ? { ...existing, ...update, updatedAt: new Date() }
          : {
              id: `seed-user-${counter++}`,
              createdAt: new Date(),
              updatedAt: new Date(),
              ...create,
            };
        storedUsers.set(where.email, record);
        return { ...record };
      },
    },
    artistProfile: {
      async upsert({ where, update, create }) {
        const existing = storedProfiles.get(where.userId);
        const record = existing ? { ...existing, ...update } : { id: "profile-1", ...create };
        storedProfiles.set(where.userId, record);
        return record;
      },
    },
  };

  const result = await seedDatabase(mockPrisma);

  // Verificar retorno público sin contraseñas ni hashes
  assert.equal(result.admin.email, SEED_USERS.admin.email);
  assert.equal(result.admin.role, "admin");
  assert.equal("password" in result.admin, false);

  assert.equal(result.user.email, SEED_USERS.user.email);
  assert.equal(result.user.role, "user");
  assert.equal("password" in result.user, false);

  // Verificar que los registros persistidos en BD tienen hash bcrypt válido
  const persistedAdmin = storedUsers.get(SEED_USERS.admin.email);
  const persistedUser = storedUsers.get(SEED_USERS.user.email);

  assert.ok(persistedAdmin);
  assert.equal(persistedAdmin.role, "admin");
  assert.notEqual(persistedAdmin.password, SEED_USERS.admin.password);
  assert.equal(await comparePassword(SEED_USERS.admin.password, persistedAdmin.password), true);

  assert.ok(persistedUser);
  assert.equal(persistedUser.role, "user");
  assert.notEqual(persistedUser.password, SEED_USERS.user.password);
  assert.equal(await comparePassword(SEED_USERS.user.password, persistedUser.password), true);
});
