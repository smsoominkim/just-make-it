import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function createConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL!;
  const connectorHostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const isProduction = process.env.NODE_ENV === "production";
  
  console.log("=== Database Connection Config ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("REPLIT_CONNECTORS_HOSTNAME:", connectorHostname || "not set");
  
  if (isProduction && connectorHostname) {
    try {
      const url = new URL(databaseUrl);
      const dbName = url.pathname.replace("/", "");
      
      const config = {
        host: connectorHostname,
        database: dbName,
        user: url.username,
        password: url.password,
        ssl: false,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        max: 10,
      };
      
      console.log("Using Replit Connector:");
      console.log("- Host:", connectorHostname);
      console.log("- Database:", dbName);
      console.log("- User:", url.username);
      console.log("================================");
      
      return config;
    } catch (error) {
      console.error("Failed to parse DATABASE_URL:", error);
    }
  }
  
  console.log("Using direct connection (development)");
  console.log("================================");
  
  return {
    connectionString: databaseUrl,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10,
  };
}

const poolConfig = createConnectionConfig();
export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

pool.on('connect', () => {
  console.log('Database pool: new client connected');
});

export const db = drizzle(pool, { schema });
