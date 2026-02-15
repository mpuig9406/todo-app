import type { Task, TaskCreateInput, TaskUpdateInput, Category } from "../types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Tasks
  tasks: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ tasks: Task[] }>(`/tasks${qs}`);
    },
    get: (id: string) => request<{ task: Task }>(`/tasks/${id}`),
    create: (data: TaskCreateInput) =>
      request<{ task: Task }>("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: TaskUpdateInput) =>
      request<{ task: Task }>(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/tasks/${id}`, { method: "DELETE" }),
    reorder: (items: { id: string; position: number }[]) =>
      request<{ success: boolean }>("/tasks/batch/reorder", {
        method: "PUT",
        body: JSON.stringify({ items }),
      }),
    stats: () =>
      request<{ total: number; completed: number; active: number; overdue: number }>(
        "/tasks/stats/summary"
      ),
  },

  // Categories
  categories: {
    list: () => request<{ categories: Category[] }>("/categories"),
    create: (data: Partial<Category>) =>
      request<{ category: Category }>("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Category>) =>
      request<{ category: Category }>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/categories/${id}`, { method: "DELETE" }),
  },

  // Health
  health: () => request<{ status: string }>("/health"),
};
