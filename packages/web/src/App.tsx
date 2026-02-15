import { useEffect } from "react";
import { useStore } from "./hooks/useStore";
import { Header } from "./components/Header";
import { Alerts } from "./components/Alerts";
import { FilterBar } from "./components/FilterBar";
import { TaskList } from "./components/TaskList";
import { TaskModal } from "./components/TaskModal";
import { Fab } from "./components/Fab";

export default function App() {
  const { dark, fetchTasks, fetchCategories, loading, error } = useStore();

  useEffect(() => {
    fetchCategories();
    fetchTasks();
  }, []);

  // Apply dark class to html
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      dark ? "#0f0f1a" : "#f1f0eb"
    );
  }, [dark]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
        dark ? "bg-[#0f0f1a]" : "bg-[#f1f0eb]"
      }`}
    >
      {/* Background dots */}
      <div
        className="fixed inset-0 bg-dots pointer-events-none"
        style={{
          color: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        }}
      />

      {/* Ambient glow */}
      <div className="fixed -top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(99,102,241,0.04),transparent_70%)]" />

      <div className="relative z-10 max-w-[640px] mx-auto px-5 pt-10 pb-24">
        <Header />
        <Alerts />
        <FilterBar />

        {loading && !useStore.getState().tasks.length ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-gray-500 mt-3 text-sm">Cargando tareas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-500 text-sm font-semibold">{error}</p>
            <button
              onClick={fetchTasks}
              className="mt-3 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <TaskList />
        )}
      </div>

      <Fab />
      <TaskModal />
    </div>
  );
}
