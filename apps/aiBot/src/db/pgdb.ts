import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { env } from "@/lib/env";
import * as schema from "@/db/schema";

export type DrizzleClient = NodePgDatabase<typeof schema>;

let dbOverride: DrizzleClient | null = null;
let readonlyDbOverride: DrizzleClient | null = null;
let pool: Pool | null = null;
let readonlyPool: Pool | null = null;
let drizzleClient: DrizzleClient | null = null;
let drizzleReadonlyClient: DrizzleClient | null = null;

function buildPoolConfig(): PoolConfig {
  return {
    host: env.postgresHost,
    port: env.postgresPort,
    database: env.postgresDatabase,
    user: env.postgresUser,
    password: env.postgresPassword,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 5,
    min: 0,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 2_000,
    options: `-c search_path=${env.postgresSchema}`
  };
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool(buildPoolConfig());
  }

  return pool;
}

function getReadonlyPool(): Pool {
  if (!readonlyPool) {
    readonlyPool = new Pool(buildPoolConfig());
  }

  return readonlyPool;
}

export function newClient(customPool?: Pool): DrizzleClient {
  return drizzle(customPool ?? getPool(), {
    schema,
    casing: "snake_case"
  });
}

export function newReadonlyClient(customPool?: Pool): DrizzleClient {
  return drizzle(customPool ?? getReadonlyPool(), {
    schema,
    casing: "snake_case"
  });
}

export function getDb(): DrizzleClient {
  if (dbOverride) {
    return dbOverride;
  }

  if (!drizzleClient) {
    drizzleClient = newClient();
  }

  return drizzleClient;
}

export function getReadonlyDb(): DrizzleClient {
  if (readonlyDbOverride) {
    return readonlyDbOverride;
  }

  if (!drizzleReadonlyClient) {
    drizzleReadonlyClient = newReadonlyClient();
  }

  return drizzleReadonlyClient;
}

export function setDbForTests(testPool: Pool | null) {
  if (!testPool) {
    dbOverride = null;
    readonlyDbOverride = null;
    return;
  }

  const db = drizzle(testPool, {
    schema,
    casing: "snake_case"
  });

  dbOverride = db;
  readonlyDbOverride = db;
}

export async function closeDbConnections() {
  const closingPools: Promise<void>[] = [];

  if (pool) {
    closingPools.push(pool.end());
    pool = null;
  }

  if (readonlyPool) {
    closingPools.push(readonlyPool.end());
    readonlyPool = null;
  }

  drizzleClient = null;
  drizzleReadonlyClient = null;

  if (closingPools.length > 0) {
    await Promise.all(closingPools);
  }
}

export { schema };
