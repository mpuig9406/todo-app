import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "../hooks/useStore";
import { formatDate, isOverdue, isUpcoming, cn } from "../lib/utils";
import type { Task } from "../types";

const PRIORITY_COLORS: Record<string, string> = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const { categories, toggleTask, deleteTask, openModal } = useStore();

  const cat = categories.find((c) => c.id === task.categoryId);
  const overdue = !task.completed && isOverdue(task.dueDate);
  const upcoming = !task.completed && isUpcoming(task.dueDate, 1);
  const shouldStart = !task.completed && task.startDate && isOverdue(task.startDate);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-2xl border mb-2 transition-all duration-300",
        "dark:bg-white/[0.03] bg-white/80",
        overdue
          ? "border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
          : "dark:border-white/[0.06] border-black/[0.06]",
        isDragging && "opacity-50 scale-[1.02] rotate-1 shadow-xl z-50",
        task.completed && "opacity-50"
      )}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-colors"
        style={{ background: task.completed ? "#6b7280" : cat?.color || "#6366f1" }}
      />

      <div className="px-5 py-3">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="pt-1 cursor-grab active:cursor-grabbing touch-none opacity-30 hover:opacity-60 transition-opacity flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="dark:text-white text-gray-800">
              <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
            </svg>
          </button>

          {/* Checkbox */}
          <button
            onClick={() => toggleTask(task.id)}
            className={cn(
              "w-6 h-6 rounded-lg border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300",
              task.completed
                ? "border-transparent"
                : "dark:border-white/15 border-black/15 hover:border-accent"
            )}
            style={task.completed ? { background: cat?.color || "#6366f1", borderColor: cat?.color } : undefined}
          >
            {task.completed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span
                className={cn(
                  "text-[15px] font-semibold flex-1 leading-relaxed",
                  "dark:text-gray-100 text-gray-800",
                  task.completed && "line-through"
                )}
              >
                {task.title}
              </span>
              {task.notes && (
                <span className="opacity-30 flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="dark:text-white text-gray-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
              )}
              <span
                className={cn(
                  "transition-transform duration-200 flex-shrink-0 opacity-40",
                  expanded && "rotate-180"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="dark:text-white text-gray-600">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {cat && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: cat.color + "18", color: cat.color }}
                >
                  {cat.icon} {cat.name}
                </span>
              )}
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: PRIORITY_COLORS[task.priority] + "18",
                  color: PRIORITY_COLORS[task.priority],
                }}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
              {task.dueDate && (
                <span
                  className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
                    overdue && "bg-red-500/15 text-red-500",
                    upcoming && !overdue && "bg-amber-500/15 text-amber-500",
                    !overdue && !upcoming && "bg-accent/10 text-accent dark:text-indigo-300"
                  )}
                >
                  {overdue && "⚠ "}📅 {formatDate(task.dueDate)}
                </span>
              )}
              {shouldStart && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 animate-pulse flex items-center gap-1">
                  ⏱ ¡Deberías empezar!
                </span>
              )}
              {task.startDate && !shouldStart && !task.completed && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md dark:bg-white/5 bg-black/5 text-gray-500">
                  ⏱ Inicio: {formatDate(task.startDate)}
                </span>
              )}
            </div>

            {/* Expanded section */}
            {expanded && (
              <div className="mt-3 pt-3 border-t dark:border-white/[0.06] border-black/[0.06] animate-fade-in">
                {task.notes && (
                  <p className="text-sm dark:text-gray-400 text-gray-500 leading-relaxed mb-3 whitespace-pre-wrap">
                    {task.notes}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(task)}
                    className="px-3 py-1.5 rounded-lg border dark:border-white/10 border-black/10 text-xs font-semibold dark:text-gray-300 text-gray-600 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
