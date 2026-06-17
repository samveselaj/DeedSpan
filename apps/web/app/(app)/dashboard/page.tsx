import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/app/task-row";
import { TaskInput } from "@/components/app/task-input";
import { HabitTile } from "@/components/app/habit-tile";
import { Topbar } from "@/components/layout/topbar";
import { apiServer } from "@/lib/api-server";
import { requireUser } from "@/lib/auth";
import { cn, formatGreeting } from "@/lib/utils";
import type { GoalPlan, Habit, Task } from "@/lib/types";

export default async function DashboardPage() {
  const user = await requireUser();
  const [tasks, habits, weekPlans, goals] = await Promise.all([
    apiServer<Task[]>("/tasks?filter=open"),
    apiServer<Habit[]>("/habits"),
    apiServer<GoalPlan[]>("/goal-plans?period_type=week"),
    apiServer<GoalPlan[]>("/goal-plans"),
  ]);

  const weekPlan = weekPlans[0];
  const visibleTasks = tasks.slice(0, 6);
  const goalTitleById = new Map(goals.map((goal) => [goal.id, goal.title]));

  return (
    <>
      <Topbar title="Today" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-5xl w-full mx-auto">
        <div className="mb-10 animate-fade-up">
          <h1 className="text-3xl font-semibold tracking-tight">
            {formatGreeting()}, {user.email.split("@")[0]}.
          </h1>
          <p className="text-sm text-muted mt-1.5">{format(new Date(), "EEEE · MMMM d")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Today</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {visibleTasks.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="h-8 w-8" />}
                  title="A clean slate"
                  description="Capture what matters today."
                />
              ) : (
                <div className="divide-y divide-border/60">
                  {visibleTasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      goalTitle={t.goal_id ? goalTitleById.get(t.goal_id) : undefined}
                    />
                  ))}
                </div>
              )}
              <div className="border-t border-border/60">
                <TaskInput goals={goals} />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle>Habits</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {habits.length === 0 ? (
                <EmptyState title="No habits yet" description="Build small, repeat often." />
              ) : (
                <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2 -mr-1">
                  {habits.map((h) => (
                    <HabitTile key={h.id} habit={h} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {weekPlan && (
          <Link
            href="/goals?period=week"
            className="block mt-6 animate-fade-up group"
          >
            <Card className="p-6 group-hover:bg-subtle/30 transition-colors duration-200 ease-soft">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted uppercase tracking-wider">
                    This week
                  </div>
                  <h2 className="text-base font-semibold mt-0.5 truncate">
                    {weekPlan.title}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted">{weekPlan.progress.label}</div>
                  <div className="text-sm font-medium tabular-nums">
                    {weekPlan.progress.completed} / {weekPlan.progress.total}
                  </div>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-subtle overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-soft",
                    weekPlan.effective_status === "completed"
                      ? "bg-success"
                      : weekPlan.effective_status === "missed"
                        ? "bg-muted"
                        : "bg-accent",
                  )}
                  style={{ width: `${weekPlan.progress.percent}%` }}
                />
              </div>
            </Card>
          </Link>
        )}
      </main>
    </>
  );
}
