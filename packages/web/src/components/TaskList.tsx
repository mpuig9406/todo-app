import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useStore } from "../hooks/useStore";
import { TaskCard } from "./TaskCard";
import type { Task } from "../types";

export function TaskList() {
  const { tasks, filters, reorderTasks } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Filter and sort tasks
  const filtered = tasks
    .filter((t) => {
      if (filters.category !== "all" && t.categoryId !== filters.category) return false;
      if (t.completed !== filters.completed) return false;
      if (
        filters.search &&
        !t.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !(t.notes || "").toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "due_date":
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        case "priority": {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        }
        case "created":
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return a.position - b.position;
      }
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filtered.findIndex((t) => t.id === active.id);
    const newIndex = filtered.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(filtered, oldIndex, newIndex);

    const items = reordered.map((t, i) => ({ id: t.id, position: i }));
    reorderTasks(items);
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-5xl mb-4">
          {filters.completed ? "🎯" : filters.search ? "🔍" : "✨"}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-[15px] font-semibold">
          {filters.completed
            ? "No hay tareas completadas aún"
            : filters.search
            ? "No se encontraron tareas"
            : "¡Todo limpio! Agrega una nueva tarea"}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filtered.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[200px]">
          {filtered.map((task, idx) => (
            <div
              key={task.id}
              className="animate-slide-down"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
