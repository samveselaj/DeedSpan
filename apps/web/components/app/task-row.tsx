"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { format, isPast, isToday, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

export function TaskRow({ task, goalTitle }: { task: Task; goalTitle?: string }) {
  const router = useRouter();
  const [done, setDone] = React.useState(!!task.completed_at);
  const [pending, startTransition] = React.useTransition();

  async function toggle() {
    const next = !done;
    setDone(next);
    try {
      await api(`/tasks/${task.id}`, { method: "PATCH", json: { completed: next } });
      startTransition(() => router.refresh());
    } catch (e) {
      setDone(!next);
      toast.error(e instanceof ApiError ? e.message : "Failed to update");
    }
  }

  async function remove() {
    try {
      await api(`/tasks/${task.id}`, { method: "DELETE" });
      startTransition(() => router.refresh());
      toast.success("Removed");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  const due = task.due_date ? parseISO(task.due_date) : null;
  const overdue = due && !done && isPast(due) && !isToday(due);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-xl",
        "hover:bg-subtle/60 transition-colors duration-200 ease-soft",
      )}
    >
      <Checkbox checked={done} onCheckedChange={toggle} aria-label="Toggle complete" />
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={cn(
            "text-sm truncate transition-opacity",
            done && "line-through text-muted",
          )}
        >
          {task.title}
        </span>
      </div>
      {due && (
        <Badge variant={overdue ? "danger" : "muted"}>
          {isToday(due) ? "Today" : format(due, "MMM d")}
        </Badge>
      )}
      {goalTitle && <Badge variant="muted">{goalTitle}</Badge>}
      <button
        onClick={remove}
        aria-label="Delete task"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger p-1 ring-focus rounded-md"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
