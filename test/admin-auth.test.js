import assert from "node:assert/strict";
import test from "node:test";

import { auth } from "../dist/config/auth.js";
import { requireAuth } from "../dist/interface/middlewares/requireAuth.js";
import { requireRole } from "../dist/interface/middlewares/requireRole.js";

test("requireAuth keeps a valid session and attaches the user", async () => {
  const originalGetSession = auth.api.getSession;
  auth.api.getSession = async () => ({ user: { id: "user_123", role: "admin" } });

  try {
    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = {
      status(code) {
        this.code = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        return payload;
      },
    };

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

test("requireRole blocks non-admin users", () => {
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return payload;
    },
  };

  const req = { user: { role: "cliente" } };
  let nextCalled = false;

  requireRole("admin")(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.code, 403);
  assert.equal(res.payload.message, "No tienes permisos para acceder a esta sección");
});
