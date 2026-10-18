import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db.js";
import * as schema from "../schemas/schema.js";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BACKEND_URL,
  trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],
  basePath: "/api/auth",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "cliente",
        input: true
      }
    },
  }});