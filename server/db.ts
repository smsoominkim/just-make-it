import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === "production";
const connectorHostname = process.env.REPLIT_CONNECTORS_HOSTNAME;

function getPoolConfig(): pg.PoolConfig {
  const databaseUrl = process.env.DATABASE_URL!;
  
  if (isProduction && connectorHostname) {
    // Parse original URL to extract credentials and database name
    const url = new URL(databaseUrl);
    const config: pg.PoolConfig = {
      host: connectorHostname,
      database: url.pathname.slice(1), // Remove leading "/"
      user: url.username,
      password: decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: false },
    };
    console.log(`Using connector hostname: ${connectorHostname}, database: ${config.database}`);
    return config;
  }
  
  console.log("Using direct database connection (development)");
  return { connectionString: databaseUrl };
}

export const pool = new Pool(getPoolConfig());
export const db = drizzle(pool, { schema });
