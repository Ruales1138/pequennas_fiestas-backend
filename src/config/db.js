import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in environment variables");
}

export const sql = neon(databaseUrl);
export const db = drizzle(sql);

export async function checkDbConnection() {
    await sql`select 1 as ok`;
}