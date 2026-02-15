import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

export function createDb(dbPath?: string) {
  const url = dbPath || process.env.DATABASE_URL || "./data/todo.db";

  // Ensure directory exists
  const dir = dirname(url);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(url);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  return drizzle(sqlite, { schema });
}

export type AppDatabase = ReturnType<typeof createDb>;
