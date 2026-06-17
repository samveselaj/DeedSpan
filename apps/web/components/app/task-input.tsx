"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";

export type TaskGoalOption = {
  id: string;
  title: string;
};

export function TaskInput({
  goalId,
  goals = [],
  placeholder = "Add a task...",
}: {
  goalId?: string;
  goals?: TaskGoalOption[];
  placeholder?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [selectedGoalId, setSelectedGoalId] = React.useState(goalId ?? "");
  const [busy, setBusy] = React.useState(false);
  const canChooseGoal = !goalId && goals.length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value || busy) return;
    setBusy(true);
    try {
      await api("/tasks", {
        method: "POST",
        json: {
          title: value,
          ...((goalId ?? selectedGoalId) ? { goal_id: goalId ?? selectedGoalId } : {}),
        },
      });
      setTitle("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Plus className="h-4 w-4 shrink-0 text-muted" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholder}
          className="h-9 border-none bg-transparent shadow-none px-0 focus-visible:ring-0"
          disabled={busy}
        />
      </div>
      {canChooseGoal && (
        <select
          value={selectedGoalId}
          onChange={(event) => setSelectedGoalId(event.target.value)}
          disabled={busy}
          aria-label="Assign to goal"
          className="h-9 rounded-xl border border-border bg-surface px-3 text-xs text-fg ring-focus transition-colors duration-200 ease-soft disabled:opacity-50"
        >
          <option value="">No goal</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      )}
    </form>
  );
}
