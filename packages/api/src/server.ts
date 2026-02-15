import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { createApp } from "./app.js";
import { categories } from "./db/schema.js";
import * as schema from "./db/schema.js";
import { existsSync, readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

// ── Database setup ──
const dbPath = process.env.DATABASE_URL || "./data/todo.db";
const dir = dirname(dbPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

// ── Run migrations directly with better-sqlite3 ──
const migrationDir = resolve(
  import.meta.dirname || new URL(".", import.meta.url).pathname,
  "../migrations"
);
const migrationFile = resolve(migrationDir, "0000_init.sql");

if (existsSync(migrationFile)) {
  const migrationSql = readFileSync(migrationFile, "utf-8");
  const statements = migrationSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      sqlite.exec(stmt);
    } catch (e) {
      // Ignore "already exists" errors
    }
  }
  console.log("✓ Database migrations applied");
}

// ── Seed default categories ──
const defaultCategories = [
  { id: "work", name: "Trabajo", color: "#6366f1", icon: "💼", position: 0 },
  { id: "personal", name: "Personal", color: "#f43f5e", icon: "🏠", position: 1 },
  { id: "health", name: "Salud", color: "#10b981", icon: "💪", position: 2 },
  { id: "learning", name: "Aprender", color: "#f59e0b", icon: "📚", position: 3 },
  { id: "finance", name: "Finanzas", color: "#8b5cf6", icon: "💰", position: 4 },
  { id: "urgent", name: "Urgente", color: "#ef4444", icon: "🔥", position: 5 },
];

for (const cat of defaultCategories) {
  try {
    db.insert(categories).values(cat).onConflictDoNothing().run();
  } catch {}
}
console.log("✓ Default categories ready");

// ── Create Hono app ──
const app = createApp(db);

// ── Serve static frontend ──
const staticDir = process.env.STATIC_DIR || "../web/dist";
app.use(
  "/*",
  serveStatic({
    root: staticDir,
  })
);

// SPA fallback
app.get("*", (c) => {
  try {
    const indexPath = resolve(staticDir, "index.html");
    if (existsSync(indexPath)) {
      const html = readFileSync(indexPath, "utf-8");
      return c.html(html);
    }
  } catch {}
  return c.text("Frontend not built. Run: pnpm --filter web build", 404);
});

const port = Number(process.env.PORT) || 3000;

console.log(`
╔══════════════════════════════════════╗
║        ✅ Todo App Running           ║
║                                      ║
║   → http://localhost:${port}            ║
║   → API: /api/health                 ║
╚══════════════════════════════════════╝
`);

serve({ fetch: app.fetch, port });