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

function getPoolConfig(): pg.PoolConfig {
  // In production, use individual PG* environment variables if available
  // These are automatically set by Replit for production deployments
  if (isProduction && process.env.PGHOST) {
    const config: pg.PoolConfig = {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : undefined,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false },
    };
    console.log(`Using production PG config: host=${config.host}, database=${config.database}`);
    return config;
  }
  
  // Fallback: use connector hostname if available
  const connectorHostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  if (isProduction && connectorHostname) {
    const databaseUrl = process.env.DATABASE_URL!;
    const url = new URL(databaseUrl);
    const config: pg.PoolConfig = {
      host: connectorHostname,
      database: url.pathname.slice(1),
      user: url.username,
      password: decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: false },
    };
    console.log(`Using connector hostname: ${connectorHostname}, database: ${config.database}`);
    return config;
  }
  
  console.log("Using direct database connection (development)");
  return { connectionString: process.env.DATABASE_URL };
}

export const pool = new Pool(getPoolConfig());
export const db = drizzle(pool, { schema });
