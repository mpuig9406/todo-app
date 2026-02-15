import { useStore } from "../hooks/useStore";
import { cn } from "../lib/utils";

export function FilterBar() {
  const { tasks, categories, filters, setFilter } = useStore();

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4 mb-5">
      {/* Search */}
      <div className="flex items-center gap-2 px-3.5 rounded-xl dark:bg-white/[0.02] bg-white/60 border dark:border-white/[0.06] border-black/[0.06]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          placeholder="Buscar tareas..."
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          className="flex-1 py-3 text-sm bg-transparent outline-none dark:text-white text-gray-800 dark:placeholder-gray-500 placeholder-gray-400"
        />
        {filters.search && (
          <button
            onClick={() => setFilter("search", "")}
            className="p-1 opacity-40 hover:opacity-80 transition-opacity dark:text-white text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter("category", "all")}
          className={cn(
            "px-3.5 py-[7px] rounded-lg text-xs font-bold transition-all",
            filters.category === "all"
              ? "bg-accent text-white"
              : "dark:bg-white/[0.06] bg-black/5 text-gray-500 dark:text-gray-400"
          )}
        >
          Todas
        </button>
        {categories.map((c) => {
          const count = tasks.filter(
            (t) => t.categoryId === c.id && t.completed === filters.completed
          ).length;
          return (
            <button
              key={c.id}
              onClick={() => setFilter("category", c.id)}
              className={cn(
                "px-3.5 py-[7px] rounded-lg text-xs font-bold transition-all",
                filters.category === c.id
                  ? "text-white"
                  : "dark:bg-white/[0.06] bg-black/5 text-gray-500 dark:text-gray-400",
                count === 0 && filters.category !== c.id && "opacity-40"
              )}
              style={
                filters.category === c.id ? { background: c.color } : undefined
              }
            >
              {c.icon} {count > 0 ? count : ""}
            </button>
          );
        })}
      </div>

      {/* Active / Completed toggle */}
      <div className="flex dark:bg-white/[0.04] bg-black/[0.04] rounded-xl p-[3px]">
        {[
          { val: false, label: `Pendientes (${activeCount})` },
          { val: true, label: `Completadas (${completedCount})` },
        ].map(({ val, label }) => (
          <button
            key={String(val)}
            onClick={() => setFilter("completed", val)}
            className={cn(
              "flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all",
              filters.completed === val
                ? "dark:bg-white/[0.08] bg-white shadow-sm dark:text-white text-gray-800"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
