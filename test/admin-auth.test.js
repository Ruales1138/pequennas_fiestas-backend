import assert from "node:assert/strict";
import test from "node:test";

import { auth } from "../dist/config/auth.js";
import { signJwtToken } from "../dist/infrastructure/services/jwt-auth.service.js";
import { AdminController } from "../dist/interface/controllers/admin.controller.js";
import { requireAuth } from "../dist/interface/middlewares/requireAuth.js";
import { requireRole } from "../dist/interface/middlewares/requireRole.js";

function createMockRes() {
  return {
    code: 200,
    payload: null,
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return payload;
    },
  };
}

test("requireAuth keeps a valid session and attaches the user", async () => {
  const originalGetSession = auth.api.getSession;
  auth.api.getSession = async () => ({ user: { id: "user_123", role: "admin" } });

  try {
    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();

    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.role, "admin");
    assert.equal(req.session.user.id, "user_123");
  } finally {
    auth.api.getSession = originalGetSession;
  }
});

test("requireAuth verifies a signed JWT Bearer token and rejects missing or malformed JWTs with 401", async () => {
  const { token } = signJwtToken({
    id: "admin-jwt-1",
    email: "admin@gigashow.com",
    role: "admin",
    name: "Admin Test",
  });

  const validReq = { headers: { authorization: `Bearer ${token}` } };
  const validRes = createMockRes();
  let nextCalled = false;

  await requireAuth(validReq, validRes, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(validReq.user.id, "admin-jwt-1");
  assert.equal(validReq.user.email, "admin@gigashow.com");
  assert.equal(validReq.user.role, "admin");

  // Invalid JWT signature -> 401
  const tamperedToken = `${token.slice(0, -4)}xxxx`;
  const invalidReq = { headers: { authorization: `Bearer ${tamperedToken}` } };
  const invalidRes = createMockRes();
  let invalidNext = false;

  await requireAuth(invalidReq, invalidRes, () => {
    invalidNext = true;
  });

  assert.equal(invalidNext, false);
  assert.equal(invalidRes.code, 401);

  // Empty Bearer token -> 401
  const emptyReq = { headers: { authorization: "Bearer   " } };
  const emptyRes = createMockRes();
  let emptyNext = false;

  await requireAuth(emptyReq, emptyRes, () => {
    emptyNext = true;
  });

  assert.equal(emptyNext, false);
  assert.equal(emptyRes.code, 401);
});

test("requireRole blocks non-admin users (403) and allows admin users", () => {
  const res = createMockRes();
  const req = { user: { role: "cliente" } };
  let nextCalled = false;

  requireRole("admin")(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.code, 403);
  assert.equal(res.payload.message, "No tienes permisos para acceder a esta sección");

  const adminRes = createMockRes();
  const adminReq = { user: { role: "admin" } };
  let adminNextCalled = false;

  requireRole("admin")(adminReq, adminRes, () => {
    adminNextCalled = true;
  });

  assert.equal(adminNextCalled, true);
});

test("AdminController lists users without password and toggles status / soft-delete on resources", async () => {
  const usersStore = [
    {
      id: "u-1",
      name: "Usuario Prueba",
      email: "user@gigashow.com",
      role: "user",
      isActive: true,
      deletedAt: null,
      createdAt: new Date(),
      password: "$2b$10$secretHashShouldNeverLeak",
    },
  ];

  const mockUserRepo = {
    findAll: async () =>
      usersStore.map(({ password: _p, ...publicUser }) => publicUser),
    findById: async (id) => usersStore.find((u) => u.id === id) ?? null,
    update: async (id, data) => {
      const target = usersStore.find((u) => u.id === id);
      Object.assign(target, data);
      const { password: _p, ...publicUser } = target;
      return publicUser;
    },
  };

  const mockArtistRepo = {
    findAllForAdmin: async () => [
      {
        id: "art-1",
        userId: "u-art-1",
        city: "Medellín",
        category: "Magia",
        baseRate: 250000,
        bio: "Mago profesional",
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        user: { name: "Mago Leo", email: "leo@gigashow.com", role: "artista" },
      },
    ],
    findByIdForAdmin: async (id) =>
      id === "art-1" ? { id: "art-1", userId: "u-art-1", isActive: true } : null,
    update: async (id, data) => ({ id, ...data }),
    softDelete: async (id) => ({ id, isActive: false, deletedAt: new Date() }),
  };

  const mockBookingRepo = {
    findAllForAdmin: async () => [],
    findByIdForAdmin: async () => null,
    update: async () => ({}),
    softDelete: async () => ({}),
  };

  const mockRatingRepo = {
    findAllForAdmin: async () => [],
    findByIdForAdmin: async () => null,
    update: async () => ({}),
    softDelete: async () => ({}),
  };

  const controller = new AdminController(
    mockUserRepo,
    mockArtistRepo,
    mockBookingRepo,
    mockRatingRepo
  );

  // 1. Listar usuarios sin exponer password
  const listRes = createMockRes();
  await controller.listUsers({}, listRes, (err) => {
    throw err;
  });
  assert.equal(listRes.code, 200);
  assert.equal(listRes.payload.ok, true);
  assert.equal(listRes.payload.data.length, 1);
  assert.equal("password" in listRes.payload.data[0], false);

  // 2. Desactivar usuario (borrado lógico)
  const patchRes = createMockRes();
  await controller.updateUserStatus(
    { params: { id: "u-1" }, body: { isActive: false } },
    patchRes,
    (err) => {
      throw err;
    }
  );
  assert.equal(patchRes.code, 200);
  assert.equal(patchRes.payload.data.isActive, false);
  assert.ok(patchRes.payload.data.deletedAt instanceof Date);

  // 3. Desactivar perfil de artista
  const deleteArtistRes = createMockRes();
  await controller.deleteArtist({ params: { id: "art-1" } }, deleteArtistRes, (err) => {
    throw err;
  });
  assert.equal(deleteArtistRes.code, 200);
  assert.equal(deleteArtistRes.payload.data.isActive, false);
});
