import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { taskRoutes } from "./routes/tasks.js";
import { categoryRoutes } from "./routes/categories.js";
import type { AppDatabase } from "./db/connection.js";

export function createApp(db: AppDatabase) {
  const app = new Hono();

  // Middleware
  app.use("*", logger());
  app.use(
    "/api/*",
    cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Health check
  app.get("/api/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Routes
  app.route("/api/tasks", taskRoutes(db));
  app.route("/api/categories", categoryRoutes(db));

  // 404 handler for API routes
  app.notFound((c) => {
    if (c.req.path.startsWith("/api")) {
      return c.json({ error: "Not found" }, 404);
    }
    // For non-API routes, return null (handled by static file serving)
    return c.text("Not found", 404);
  });

  return app;
}
