import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use placeholder for build time, actual URL required at runtime
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@placeholder/placeholder";

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

export * from "./schema";
