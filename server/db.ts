import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set. Did you forget to provision a database?");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function getConnectionString(): string {
  let connectionString = process.env.DATABASE_URL!;
  
  if (process.env.NODE_ENV === 'production' && process.env.REPLIT_CONNECTORS_HOSTNAME) {
    try {
      const url = new URL(connectionString);
      url.hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
      connectionString = url.toString();
      console.log('Using REPLIT_CONNECTORS_HOSTNAME for database connection');
    } catch (e) {
      console.error('Failed to parse DATABASE_URL:', e);
    }
  }
  
  return connectionString;
}

export const pool = new Pool({ 
  connectionString: getConnectionString(),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const db = drizzle(pool, { schema });
