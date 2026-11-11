import assert from "node:assert/strict";
import test from "node:test";

import {
  RegisterUserUseCase,
  LoginUserUseCase,
} from "../dist/application/index.js";
import {
  hashPassword,
  comparePassword,
  signJwtToken,
  verifyJwtToken,
  getJwtSecret,
} from "../dist/infrastructure/services/jwt-auth.service.js";
import { AuthController } from "../dist/interface/controllers/auth.controller.js";
import { globalErrorHandler } from "../dist/interface/middlewares/error.middleware.js";

function createMockUserRepo() {
  const users = new Map();
  let idCounter = 1;

  return {
    async findByEmail(email) {
      const normalized = email.trim().toLowerCase();
      for (const u of users.values()) {
        if (u.email === normalized) return { ...u };
      }
      return null;
    },
    async findById(id) {
      const u = users.get(id);
      return u ? { ...u } : null;
    },
    async create(data) {
      const user = {
        id: `user-${idCounter++}`,
        name: data.name,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        emailVerified: false,
        image: data.image ?? null,
        role: data.role,
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(user.id, user);
      return { ...user };
    },
    async update(id, data) {
      const existing = users.get(id);
      const updated = { ...existing, ...data, updatedAt: new Date() };
      users.set(id, updated);
      const { password, ...publicUser } = updated;
      return publicUser;
    },
    async findAll() {
      return Array.from(users.values()).map(({ password, ...u }) => u);
    },
    async ensureArtistProfile() {},
    _rawUsers: users,
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("bcrypt hashes password and compares credentials accurately", async () => {
  const plain = "Segura123!";
  const hash = await hashPassword(plain);

  assert.notEqual(hash, plain);
  assert.equal(hash.startsWith("$2b$10$") || hash.startsWith("$2a$10$"), true);
  assert.equal(await comparePassword(plain, hash), true);
  assert.equal(await comparePassword("Incorrecta999", hash), false);
});

test("JWT service reads JWT_SECRET strictly from process.env and signs/verifies payload", () => {
  const previousSecret = process.env.JWT_SECRET;

  try {
    delete process.env.JWT_SECRET;
    assert.throws(() => getJwtSecret(), /JWT_SECRET/);

    process.env.JWT_SECRET = "unit-test-super-secret";
    const signed = signJwtToken({
      id: "u-100",
      email: "cliente@gigashow.com",
      role: "cliente",
      name: "Cliente Prueba",
    });

    assert.ok(signed.token);
    assert.ok(signed.expiresAt);
    assert.equal(typeof signed.expiresIn, "number");

    const decoded = verifyJwtToken(signed.token);
    assert.equal(decoded.id, "u-100");
    assert.equal(decoded.email, "cliente@gigashow.com");
    assert.equal(decoded.role, "cliente");
    assert.ok(decoded.exp);
  } finally {
    process.env.JWT_SECRET = previousSecret || "unit-test-super-secret";
  }
});

test("POST /api/auth/register creates user, returns 201 + JWT, omits password/hash, and rejects duplicate with 409", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "unit-test-super-secret";
  const repo = createMockUserRepo();
  const registerUseCase = new RegisterUserUseCase(repo);
  const loginUseCase = new LoginUserUseCase(repo);
  const controller = new AuthController(registerUseCase, loginUseCase, repo);

  // 1. Registro exitoso
  const req1 = {
    body: {
      name: "María López",
      email: "maria@gigashow.com",
      password: "Password123",
    },
  };
  const res1 = createMockRes();
  await controller.register(req1, res1, (err) => globalErrorHandler(err, req1, res1, () => {}));

  assert.equal(res1.statusCode, 201);
  assert.equal(res1.body.ok, true);
  assert.equal(res1.body.user.email, "maria@gigashow.com");
  assert.equal(res1.body.user.role, "cliente");
  assert.equal("password" in res1.body.user, false);
  assert.equal("passwordHash" in res1.body.user, false);
  assert.ok(res1.body.token);
  assert.ok(res1.body.expiresAt);

  // Verificar que en el repositorio la contraseña sí quedó encriptada con bcrypt
  const savedRaw = repo._rawUsers.get(res1.body.user.id);
  assert.notEqual(savedRaw.password, "Password123");
  assert.equal(await comparePassword("Password123", savedRaw.password), true);

  // 2. Registro duplicado -> 409 Conflict
  const reqDup = {
    body: {
      name: "María Duplicada",
      email: "MARIA@gigashow.com",
      password: "Password123",
    },
  };
  const resDup = createMockRes();
  await controller.register(reqDup, resDup, (err) => globalErrorHandler(err, reqDup, resDup, () => {}));
  assert.equal(resDup.statusCode, 409);
  assert.equal(resDup.body.ok, false);

  // 3. Bloqueo de auto-asignación de rol admin desde el registro -> 400
  const reqAdmin = {
    body: {
      name: "Intento Admin",
      email: "hacker@gigashow.com",
      password: "Password123",
      role: "admin",
    },
  };
  const resAdmin = createMockRes();
  await controller.register(reqAdmin, resAdmin, (err) => globalErrorHandler(err, reqAdmin, resAdmin, () => {}));
  assert.equal(resAdmin.statusCode, 400);
  assert.equal(resAdmin.body.ok, false);
});

test("POST /api/auth/login validates credentials with bcrypt and returns generic 401 on failure", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "unit-test-super-secret";
  const repo = createMockUserRepo();
  const registerUseCase = new RegisterUserUseCase(repo);
  const loginUseCase = new LoginUserUseCase(repo);
  const controller = new AuthController(registerUseCase, loginUseCase, repo);

  await registerUseCase.execute({
    name: "Carlos Artista",
    email: "carlos@gigashow.com",
    password: "MiClaveSegura99",
    role: "artista",
  });

  // 1. Login exitoso
  const reqLogin = {
    body: {
      email: "carlos@gigashow.com",
      password: "MiClaveSegura99",
    },
  };
  const resLogin = createMockRes();
  await controller.login(reqLogin, resLogin, (err) => globalErrorHandler(err, reqLogin, resLogin, () => {}));

  assert.equal(resLogin.statusCode, 200);
  assert.equal(resLogin.body.ok, true);
  assert.equal(resLogin.body.user.email, "carlos@gigashow.com");
  assert.equal(resLogin.body.user.role, "artista");
  assert.equal("password" in resLogin.body.user, false);
  assert.ok(resLogin.body.token);

  const decoded = verifyJwtToken(resLogin.body.token);
  assert.equal(decoded.email, "carlos@gigashow.com");
  assert.equal(decoded.role, "artista");

  // 2. Contraseña incorrecta -> 401 genérico
  const reqWrongPass = {
    body: {
      email: "carlos@gigashow.com",
      password: "ClaveIncorrecta",
    },
  };
  const resWrongPass = createMockRes();
  await controller.login(reqWrongPass, resWrongPass, (err) =>
    globalErrorHandler(err, reqWrongPass, resWrongPass, () => {})
  );
  assert.equal(resWrongPass.statusCode, 401);
  assert.equal(resWrongPass.body.message, "Credenciales inválidas");

  // 3. Usuario inexistente -> mismo 401 genérico
  const reqNoUser = {
    body: {
      email: "noexiste@gigashow.com",
      password: "MiClaveSegura99",
    },
  };
  const resNoUser = createMockRes();
  await controller.login(reqNoUser, resNoUser, (err) =>
    globalErrorHandler(err, reqNoUser, resNoUser, () => {})
  );
  assert.equal(resNoUser.statusCode, 401);
  assert.equal(resNoUser.body.message, "Credenciales inválidas");
});
