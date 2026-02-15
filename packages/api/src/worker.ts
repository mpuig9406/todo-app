import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema.js";
import { taskRoutes } from "./routes/tasks.js";
import { categoryRoutes } from "./routes/categories.js";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/api/health", (c) => {
  return c.json({ status: "ok", runtime: "cloudflare-workers" });
});

// Mount routes with D1 database
app.route("/api/tasks", {
  fetch: (req, env) => {
    const db = drizzle(env.DB, { schema }) as any;
    return taskRoutes(db).fetch(req, env);
  },
} as any);

app.route("/api/categories", {
  fetch: (req, env) => {
    const db = drizzle(env.DB, { schema }) as any;
    return categoryRoutes(db).fetch(req, env);
  },
} as any);

export default app;
