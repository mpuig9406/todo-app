import { create } from "zustand";
import { api } from "../lib/api";
import type { Task, Category, TaskCreateInput, TaskUpdateInput, FilterState } from "../types";

interface AppStore {
  // Data
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Filters
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string | boolean) => void;

  // Theme
  dark: boolean;
  toggleDark: () => void;

  // Modal
  modalOpen: boolean;
  editingTask: Task | null;
  openModal: (task?: Task) => void;
  closeModal: () => void;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTask: (data: TaskCreateInput) => Promise<void>;
  updateTask: (id: string, data: TaskUpdateInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (items: { id: string; position: number }[]) => Promise<void>;
}

export const useStore = create<AppStore>((set, get) => ({
  tasks: [],
  categories: [],
  loading: false,
  error: null,

  filters: {
    category: "all",
    completed: false,
    search: "",
    sort: "position",
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  dark: true,
  toggleDark: () => set((state) => ({ dark: !state.dark })),

  modalOpen: false,
  editingTask: null,
  openModal: (task) => set({ modalOpen: true, editingTask: task || null }),
  closeModal: () => set({ modalOpen: false, editingTask: null }),

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { tasks } = await api.tasks.list();
      set({ tasks, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { categories } = await api.categories.list();
      set({ categories });
    } catch {}
  },

  createTask: async (data) => {
    try {
      const { task } = await api.tasks.create(data);
      set((state) => ({ tasks: [...state.tasks, task] }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  updateTask: async (id, data) => {
    try {
      const { task } = await api.tasks.update(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));

    try {
      await api.tasks.update(id, { completed: !task.completed });
    } catch {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, completed: task.completed } : t
        ),
      }));
    }
  },

  deleteTask: async (id) => {
    const prev = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    try {
      await api.tasks.delete(id);
    } catch {
      set({ tasks: prev });
    }
  },

  reorderTasks: async (items) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => {
        const reordered = items.find((i) => i.id === t.id);
        return reordered ? { ...t, position: reordered.position } : t;
      }),
    }));

    try {
      await api.tasks.reorder(items);
    } catch (e) {
      // Refetch on error
      get().fetchTasks();
    }
  },
}));
