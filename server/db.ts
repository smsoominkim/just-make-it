import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function getConnectionString(): string {
  const databaseUrl = process.env.DATABASE_URL!;
  const connectorHostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction || !connectorHostname) {
    console.log("Using direct database connection (development)");
    return databaseUrl;
  }
  
  try {
    const url = new URL(databaseUrl);
    url.hostname = connectorHostname;
    url.port = "";
    console.log(`Using connector hostname for database: ${connectorHostname}`);
    return url.toString();
  } catch (error) {
    console.error("Failed to parse DATABASE_URL, using as-is:", error);
    return databaseUrl;
  }
}

const isProduction = process.env.NODE_ENV === "production";
const connectionString = getConnectionString();

export const pool = new Pool({ 
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });
