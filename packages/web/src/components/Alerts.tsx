import { useMemo } from "react";
import { useStore } from "../hooks/useStore";
import { isOverdue, isUpcoming } from "../lib/utils";

interface Alert {
  id: string;
  msg: string;
  type: "error" | "warning" | "info";
}

export function Alerts() {
  const { tasks } = useStore();

  const alerts = useMemo(() => {
    const list: Alert[] = [];
    tasks.forEach((t) => {
      if (t.completed) return;
      if (isOverdue(t.dueDate)) {
        list.push({ id: t.id, msg: `"${t.title}" está vencida`, type: "error" });
      } else if (isUpcoming(t.dueDate, 1)) {
        list.push({ id: t.id, msg: `"${t.title}" vence hoy`, type: "warning" });
      }
      if (t.startDate && isOverdue(t.startDate)) {
        list.push({ id: `${t.id}-start`, msg: `Deberías comenzar "${t.title}"`, type: "info" });
      }
    });
    return list;
  }, [tasks]);

  if (alerts.length === 0) return null;

  const styles: Record<string, string> = {
    error: "bg-red-500/10 text-red-500 border-red-500/15",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/15",
    info: "bg-accent/[0.08] text-accent dark:text-indigo-300 border-accent/10",
  };

  return (
    <div className="mb-5 space-y-1.5">
      {alerts.slice(0, 3).map((a) => (
        <div
          key={a.id}
          className={`px-3.5 py-2.5 rounded-xl text-[13px] font-semibold border flex items-center gap-2 animate-slide-down ${styles[a.type]}`}
        >
          {a.type === "error" ? "⚠" : "⏱"} {a.msg}
        </div>
      ))}
    </div>
  );
}
