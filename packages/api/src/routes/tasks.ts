import { Hono } from "hono";
import { z } from "zod";
import { eq, desc, asc, like, and, sql } from "drizzle-orm";
import { tasks, categories } from "../db/schema.js";
import type { AppDatabase } from "../db/connection.js";

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  notes: z.string().max(5000).optional().default(""),
  categoryId: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  completed: z.boolean().optional(),
  position: z.number().optional(),
});

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      position: z.number(),
    })
  ),
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function taskRoutes(db: AppDatabase) {
  const app = new Hono();

  // GET /tasks - List tasks with filtering
  app.get("/", async (c) => {
    try {
      const category = c.req.query("category");
      const completed = c.req.query("completed");
      const search = c.req.query("search");
      const priority = c.req.query("priority");
      const sortBy = c.req.query("sort") || "position";

      const conditions = [];

      if (category && category !== "all") {
        conditions.push(eq(tasks.categoryId, category));
      }
      if (completed !== undefined) {
        conditions.push(eq(tasks.completed, completed === "true"));
      }
      if (priority) {
        conditions.push(eq(tasks.priority, priority as any));
      }
      if (search) {
        conditions.push(
          sql`(${tasks.title} LIKE ${"%" + search + "%"} OR ${tasks.notes} LIKE ${"%" + search + "%"})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const orderBy =
        sortBy === "due_date"
          ? asc(tasks.dueDate)
          : sortBy === "created"
          ? desc(tasks.createdAt)
          : sortBy === "priority"
          ? desc(tasks.priority)
          : asc(tasks.position);

      const result = await db
        .select()
        .from(tasks)
        .where(where)
        .orderBy(orderBy);

      return c.json({ tasks: result });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return c.json({ error: "Failed to fetch tasks" }, 500);
    }
  });

  // GET /tasks/:id - Get single task
  app.get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      if (result.length === 0) {
        return c.json({ error: "Task not found" }, 404);
      }

      return c.json({ task: result[0] });
    } catch (error) {
      return c.json({ error: "Failed to fetch task" }, 500);
    }
  });

  // POST /tasks - Create task
  app.post("/", async (c) => {
    try {
      const body = await c.req.json();
      const data = createTaskSchema.parse(body);

      // Get max position
      const maxPos = await db
        .select({ max: sql<number>`COALESCE(MAX(position), -1)` })
        .from(tasks);

      const newTask = {
        id: generateId(),
        title: data.title,
        notes: data.notes || "",
        categoryId: data.categoryId || null,
        priority: data.priority || "medium",
        dueDate: data.dueDate || null,
        startDate: data.startDate || null,
        completed: false,
        position: (maxPos[0]?.max ?? -1) + 1,
      };

      await db.insert(tasks).values(newTask);

      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, newTask.id))
        .limit(1);

      return c.json({ task: result[0] }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Error creating task:", error);
      return c.json({ error: "Failed to create task" }, 500);
    }
  });

  // PUT /tasks/:id - Update task
  app.put("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const data = updateTaskSchema.parse(body);

      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
      if (data.startDate !== undefined) updateData.startDate = data.startDate;
      if (data.position !== undefined) updateData.position = data.position;

      if (data.completed !== undefined) {
        updateData.completed = data.completed;
        updateData.completedAt = data.completed
          ? new Date().toISOString()
          : null;
      }

      await db.update(tasks).set(updateData).where(eq(tasks.id, id));

      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      if (result.length === 0) {
        return c.json({ error: "Task not found" }, 404);
      }

      return c.json({ task: result[0] });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      return c.json({ error: "Failed to update task" }, 500);
    }
  });

  // PUT /tasks/reorder - Batch reorder tasks
  app.put("/batch/reorder", async (c) => {
    try {
      const body = await c.req.json();
      const data = reorderSchema.parse(body);

      for (const item of data.items) {
        await db
          .update(tasks)
          .set({ position: item.position, updatedAt: new Date().toISOString() })
          .where(eq(tasks.id, item.id));
      }

      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: "Failed to reorder tasks" }, 500);
    }
  });

  // DELETE /tasks/:id - Delete task
  app.delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      await db.delete(tasks).where(eq(tasks.id, id));
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: "Failed to delete task" }, 500);
    }
  });

  // GET /tasks/stats/summary - Task statistics
  app.get("/stats/summary", async (c) => {
    try {
      const total = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks);
      const completed = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(eq(tasks.completed, true));
      const overdue = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(
          and(
            eq(tasks.completed, false),
            sql`${tasks.dueDate} < date('now')`
          )
        );

      return c.json({
        total: total[0].count,
        completed: completed[0].count,
        active: total[0].count - completed[0].count,
        overdue: overdue[0].count,
      });
    } catch (error) {
      return c.json({ error: "Failed to fetch stats" }, 500);
    }
  });

  return app;
}
