import { useState, useEffect, useRef } from "react";
import { useStore } from "../hooks/useStore";
import type { Task, TaskCreateInput } from "../types";
import { cn } from "../lib/utils";

const PRIORITIES = [
  { id: "low" as const, label: "Baja", color: "bg-gray-500" },
  { id: "medium" as const, label: "Media", color: "bg-amber-500" },
  { id: "high" as const, label: "Alta", color: "bg-red-500" },
];

export function TaskModal() {
  const { modalOpen, editingTask, closeModal, categories, createTask, updateTask } =
    useStore();
  const titleRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    notes: "",
    categoryId: categories[0]?.id || "work",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    startDate: "",
  });

  useEffect(() => {
    if (modalOpen) {
      if (editingTask) {
        setForm({
          title: editingTask.title,
          notes: editingTask.notes || "",
          categoryId: editingTask.categoryId || categories[0]?.id || "work",
          priority: editingTask.priority,
          dueDate: editingTask.dueDate || "",
          startDate: editingTask.startDate || "",
        });
      } else {
        setForm({
          title: "",
          notes: "",
          categoryId: categories[0]?.id || "work",
          priority: "medium",
          dueDate: "",
          startDate: "",
        });
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [modalOpen, editingTask, categories]);

  if (!modalOpen) return null;

  const selectedCat = categories.find((c) => c.id === form.categoryId);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    const data: TaskCreateInput = {
      title: form.title.trim(),
      notes: form.notes,
      categoryId: form.categoryId,
      priority: form.priority,
      dueDate: form.dueDate || null,
      startDate: form.startDate || null,
    };

    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    closeModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
    if (e.key === "Escape") {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closeModal}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-[min(480px,92vw)] max-h-[85vh] overflow-auto rounded-2xl border shadow-2xl animate-slide-up",
          "dark:bg-[#1a1a2e] dark:border-white/10 bg-white border-black/10"
        )}
      >
        {/* Color accent bar */}
        <div
          className="h-1 rounded-t-2xl"
          style={{ background: selectedCat?.color || "#6366f1" }}
        />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold dark:text-white">
              {editingTask ? "Editar tarea" : "Nueva tarea"}
            </h2>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors dark:text-gray-400"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <input
            ref={titleRef}
            placeholder="¿Qué necesitas hacer?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={cn(
              "w-full px-4 py-3.5 text-base font-semibold rounded-xl border-[1.5px] outline-none transition-colors",
              "dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-500",
              "bg-black/[0.03] border-black/10 placeholder-gray-400",
              "focus:border-accent dark:focus:border-accent"
            )}
          />

          {/* Notes */}
          <textarea
            placeholder="Notas adicionales..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className={cn(
              "w-full px-4 py-3 text-sm rounded-xl border-[1.5px] outline-none resize-y transition-colors",
              "dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-500",
              "bg-black/[0.03] border-black/10 placeholder-gray-400",
              "focus:border-accent dark:focus:border-accent"
            )}
          />

          {/* Category */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setForm({ ...form, categoryId: c.id })}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200",
                    form.categoryId === c.id
                      ? "text-white scale-105"
                      : "dark:bg-white/5 bg-black/5 text-gray-500 dark:text-gray-400 hover:scale-105"
                  )}
                  style={
                    form.categoryId === c.id
                      ? { background: c.color }
                      : undefined
                  }
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Prioridad
            </label>
            <div className="flex gap-2 mt-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setForm({ ...form, priority: p.id })}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all",
                    form.priority === p.id
                      ? `${p.color} text-white`
                      : "dark:bg-white/5 bg-black/5 text-gray-500 dark:text-gray-400"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                ⏱ Comenzar
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={cn(
                  "w-full px-3 py-2.5 mt-1.5 text-sm rounded-lg border-[1.5px] outline-none",
                  "dark:bg-white/5 dark:border-white/10 dark:text-white",
                  "bg-black/[0.03] border-black/10"
                )}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                📅 Fecha límite
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={cn(
                  "w-full px-3 py-2.5 mt-1.5 text-sm rounded-lg border-[1.5px] outline-none",
                  "dark:bg-white/5 dark:border-white/10 dark:text-white",
                  "bg-black/[0.03] border-black/10"
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className={cn(
              "w-full py-3.5 rounded-xl text-[15px] font-bold transition-all duration-300",
              form.title.trim()
                ? "text-white cursor-pointer hover:brightness-110 active:scale-[0.98]"
                : "dark:bg-white/5 bg-black/5 text-gray-400 cursor-default"
            )}
            style={
              form.title.trim()
                ? { background: selectedCat?.color || "#6366f1" }
                : undefined
            }
          >
            {editingTask ? "Guardar cambios" : "Crear tarea"}{" "}
            <span className="opacity-50 text-xs ml-1">⌘↵</span>
          </button>
        </div>
      </div>
    </div>
  );
}
