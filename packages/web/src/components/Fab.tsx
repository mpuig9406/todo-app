import { useStore } from "../hooks/useStore";

export function Fab() {
  const { openModal } = useStore();

  return (
    <button
      onClick={() => openModal()}
      className="fixed bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-500 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.35)] z-40 cursor-pointer hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300"
      aria-label="Nueva tarea"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
