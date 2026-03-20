import { sql } from "drizzle-orm";
import { getDb } from "@/db/pgdb";

export async function checkDbHealth(): Promise<{ ok: boolean }> {
  await getDb().execute(sql`select 1 as ok`);
  return { ok: true };
}
