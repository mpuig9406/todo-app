import { createDb } from "./connection.js";
import { categories } from "./schema.js";
import { sql } from "drizzle-orm";

const db = createDb();

console.log("Seeding database...");

// Create default categories
const defaultCategories = [
  { id: "work", name: "Trabajo", color: "#6366f1", icon: "💼", position: 0 },
  { id: "personal", name: "Personal", color: "#f43f5e", icon: "🏠", position: 1 },
  { id: "health", name: "Salud", color: "#10b981", icon: "💪", position: 2 },
  { id: "learning", name: "Aprender", color: "#f59e0b", icon: "📚", position: 3 },
  { id: "finance", name: "Finanzas", color: "#8b5cf6", icon: "💰", position: 4 },
  { id: "urgent", name: "Urgente", color: "#ef4444", icon: "🔥", position: 5 },
];

for (const cat of defaultCategories) {
  db.insert(categories)
    .values(cat)
    .onConflictDoNothing()
    .run();
}

console.log("Seeded categories!");
console.log("Done!");
