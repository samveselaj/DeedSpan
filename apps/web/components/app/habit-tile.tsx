"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Flame, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Habit } from "@/lib/types";

export function HabitTile({ habit }: { habit: Habit }) {
  const router = useRouter();
  const [done, setDone] = React.useState(habit.completed_this_period);
  const [streak, setStreak] = React.useState(habit.streak);

  const periodLabel =
    habit.cadence === "weekly"
      ? "this week"
      : habit.cadence === "monthly"
        ? "this month"
        : "today";
  const streakUnit =
    habit.cadence === "weekly" ? "week" : habit.cadence === "monthly" ? "month" : "day";
  const cadenceBadge =
    habit.cadence === "weekly" ? "Weekly" : habit.cadence === "monthly" ? "Monthly" : null;

  async function tick() {
    const next = !done;
    setDone(next);
    // Optimistic streak nudge: only adjust when crossing the period boundary.
    setStreak(next ? streak + (habit.completed_this_period ? 0 : 1) : Math.max(0, streak - 1));
    try {
      const res = await api<{ streak: number }>(`/habits/${habit.id}/tick`, {
        method: "POST",
        json: { date: new Date().toISOString().slice(0, 10), completed: next },
      });
      setStreak(res.streak);
      router.refresh();
    } catch (e) {
      setDone(!next);
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  async function remove() {
    try {
      await api(`/habits/${habit.id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <Card className="group p-5 flex items-center gap-4 hover:bg-subtle/40 transition-colors duration-200 ease-soft">
      <button
        onClick={tick}
        aria-label={done ? `Mark not done ${periodLabel}` : `Mark done ${periodLabel}`}
        className={cn(
          "h-10 w-10 rounded-full border flex-shrink-0 ring-focus transition-all duration-200 ease-soft",
          done
            ? "bg-accent border-accent text-accent-fg shadow-soft"
            : "border-border bg-surface hover:border-accent/40",
        )}
      >
        <span className={cn("block", !done && "opacity-0")}>✓</span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-sm font-medium truncate">{habit.name}</div>
          {cadenceBadge && (
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted border border-border rounded-full px-1.5 py-0.5">
              {cadenceBadge}
            </span>
          )}
        </div>
        <div className="text-xs text-muted mt-0.5 flex items-center gap-1">
          {streak > 0 ? (
            <>
              <Flame className="h-3 w-3 text-accent" />
              <span>
                {streak}-{streakUnit} streak · {done ? `Done ${periodLabel}` : `Not done ${periodLabel}`}
              </span>
            </>
          ) : (
            <span>{done ? `Done ${periodLabel}` : `Start ${periodLabel}`}</span>
          )}
        </div>
      </div>
      <button
        onClick={remove}
        aria-label="Delete habit"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger p-1 rounded-md ring-focus"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </Card>
  );
}
