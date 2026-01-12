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
  const connectorHostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  // In production, MUST use connector hostname to access database from Cloud Run
  if (isProduction && connectorHostname) {
    // Use PGDATABASE, PGUSER, PGPASSWORD if available, otherwise parse from DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL!;
    const url = new URL(databaseUrl);
    
    const config: pg.PoolConfig = {
      host: connectorHostname,
      // No port - connector handles routing
      database: process.env.PGDATABASE || url.pathname.slice(1),
      user: process.env.PGUSER || url.username,
      password: process.env.PGPASSWORD || decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: false },
    };
    console.log(`Production: Using connector ${connectorHostname}, database: ${config.database}`);
    return config;
  }
  
  // Development: use DATABASE_URL directly
  console.log("Development: Using direct database connection");
  return { connectionString: process.env.DATABASE_URL };
}

export const pool = new Pool(getPoolConfig());
export const db = drizzle(pool, { schema });
