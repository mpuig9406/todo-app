import { Hono } from "hono";
import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { categories } from "../db/schema.js";
import type { AppDatabase } from "../db/connection.js";

const categorySchema = z.object({
  id: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  icon: z.string().max(10).default("📋"),
  position: z.number().optional(),
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function categoryRoutes(db: AppDatabase) {
  const app = new Hono();

  // GET /categories
  app.get("/", async (c) => {
    try {
      const result = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.position));
      return c.json({ categories: result });
    } catch (error) {
      return c.json({ error: "Failed to fetch categories" }, 500);
    }
  });

  // POST /categories
  app.post("/", async (c) => {
    try {
      const body = await c.req.json();
      const data = categorySchema.parse(body);

      const newCat = {
        id: data.id || generateId(),
        name: data.name,
        color: data.color,
        icon: data.icon,
        position: data.position ?? 0,
      };

      await db.insert(categories).values(newCat);
      return c.json({ category: newCat }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      return c.json({ error: "Failed to create category" }, 500);
    }
  });

  // PUT /categories/:id
  app.put("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const data = categorySchema.partial().parse(body);

      await db.update(categories).set(data).where(eq(categories.id, id));

      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      return c.json({ category: result[0] });
    } catch (error) {
      return c.json({ error: "Failed to update category" }, 500);
    }
  });

  // DELETE /categories/:id
  app.delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      await db.delete(categories).where(eq(categories.id, id));
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: "Failed to delete category" }, 500);
    }
  });

  return app;
}
