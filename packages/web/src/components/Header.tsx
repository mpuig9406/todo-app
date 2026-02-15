import { useStore } from "../hooks/useStore";

export function Header() {
  const { tasks, dark, toggleDark } = useStore();
  const active = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-extrabold dark:text-white text-gray-900 font-display tracking-tight">
            Mis Tareas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
            {active} pendiente{active !== 1 ? "s" : ""} ·{" "}
            {completed} completada{completed !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={toggleDark}
          className="p-3 rounded-xl border dark:border-white/[0.06] border-black/[0.06] dark:bg-white/[0.02] bg-white/60 cursor-pointer dark:text-white text-gray-700 hover:scale-105 transition-transform"
        >
          {dark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full dark:bg-white/[0.06] bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-purple-400 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
