"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Check, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "./task-row";
import { TaskInput } from "./task-input";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { GoalPlan, Task } from "@/lib/types";

function formatPeriod(start: string, end: string) {
  const s = parseISO(start);
  const e = parseISO(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${format(s, "MMM d")} – ${format(e, "d, yyyy")}`;
  }
  if (sameYear) {
    return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
  }
  return `${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")}`;
}

export function PlanCard({ plan, tasks }: { plan: GoalPlan; tasks: Task[] }) {
  const router = useRouter();

  async function remove() {
    try {
      await api(`/goal-plans/${plan.id}`, { method: "DELETE" });
      toast.success("Goal removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed_at).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const status =
    total > 0 && completed === total
      ? "completed"
      : plan.effective_status === "missed"
        ? "missed"
        : "active";

  return (
    <Card className="p-0 overflow-hidden animate-fade-up">
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight truncate">
              {plan.title}
            </h2>
            <p className="text-xs text-muted mt-1">
              {formatPeriod(plan.period_start, plan.period_end)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Goal options"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-subtle ring-focus transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={remove} className="text-danger">
                <Trash2 className="h-4 w-4" />
                Delete goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted">{plan.progress.label}</span>
            <span className="font-medium tabular-nums">
              {completed} of {total} tasks complete
              {total > 0 && ` · ${percent}%`}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-subtle overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-soft",
                status === "completed"
                  ? "bg-success"
                  : status === "missed"
                    ? "bg-muted"
                    : "bg-accent",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {status === "completed" && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-success/20 bg-success/5 p-3.5">
            <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
            <p className="text-sm text-fg/85 leading-relaxed">
              Goal completed. Strong consistency this period.
            </p>
          </div>
        )}

        {status === "missed" && (
          <div className="mt-5 rounded-xl border border-border bg-subtle/60 p-3.5">
            <p className="text-sm text-muted leading-relaxed">
              Goal not completed. Review, adjust, and continue.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border/60">
        {tasks.length > 0 ? (
          <div className="divide-y divide-border/60 py-1">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tasks yet"
            description="Add the next action for this goal."
            className="py-8"
          />
        )}
        <div className="border-t border-border/60">
          <TaskInput goalId={plan.id} placeholder="Add a task to this goal..." />
        </div>
      </div>
    </Card>
  );
}
