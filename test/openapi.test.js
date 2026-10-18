import assert from "node:assert/strict";
import test from "node:test";
import { openApiDocument } from "../src/config/openapi.js";

test("OpenAPI document exposes the health endpoints", () => {
  assert.equal(openApiDocument.openapi, "3.0.3");
  assert.equal(openApiDocument.info.title, "GigaShow API");
  assert.ok(openApiDocument.paths["/health"]);
  assert.ok(openApiDocument.paths["/health/db"]);
  assert.ok(openApiDocument.paths["/api/db/tables"]);
});

test("OpenAPI health endpoint defines a successful response", () => {
  const healthEndpoint = openApiDocument.paths["/health"].get;

  assert.equal(healthEndpoint.responses[200].description, "Backend disponible");
  assert.equal(
    healthEndpoint.responses[200].content["application/json"].schema.properties.ok.type,
    "boolean",
  );
});
