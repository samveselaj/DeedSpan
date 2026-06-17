"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import type { Goal, GoalProgress } from "@/lib/types";

export function GoalCard({ goal, progress }: { goal: Goal; progress: GoalProgress }) {
  const router = useRouter();

  async function remove() {
    try {
      await api(`/goals/${goal.id}`, { method: "DELETE" });
      toast.success("Goal removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <Card className="group p-6 hover:bg-subtle/30 transition-colors duration-200 ease-soft">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight truncate">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-muted mt-1 line-clamp-2">{goal.description}</p>
            )}
          </div>
          <button
            onClick={remove}
            aria-label="Delete goal"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger p-1 rounded-md ring-focus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted">
              {progress.completed} of {progress.total} tasks
            </span>
            <span className="font-medium tabular-nums">{progress.percent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-subtle overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-soft"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {goal.target_date ? (
            <Badge variant="muted">by {format(parseISO(goal.target_date), "MMM d")}</Badge>
          ) : (
            <span />
          )}
          <Badge variant={goal.status === "done" ? "success" : "default"}>{goal.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
