import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/pequennas_fiestas";

export const sql = postgres(databaseUrl);
export const db = drizzle(sql);

export async function checkDbConnection() {
    await sql`select 1 as ok`;
}