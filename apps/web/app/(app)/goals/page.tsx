import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { GoalPlanInput } from "@/components/app/goal-plan-input";
import { PlanCard } from "@/components/app/plan-card";
import { PlanPeriodTabs } from "@/components/app/plan-period-tabs";
import { CreatePlanDialog } from "@/components/app/create-plan-dialog";
import { Topbar } from "@/components/layout/topbar";
import { apiServer } from "@/lib/api-server";
import type { GoalPlan, PeriodType, Task } from "@/lib/types";

const VALID_PERIODS: PeriodType[] = ["week", "month", "year", "decade", "custom"];
const MAX_GOALS_PER_TIMELINE = 20;

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function GoalsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = params.period as PeriodType | undefined;
  const period: PeriodType = requested && VALID_PERIODS.includes(requested) ? requested : "week";

  const [plans, tasks] = await Promise.all([
    apiServer<GoalPlan[]>(`/goal-plans?period_type=${period}`),
    apiServer<Task[]>("/tasks?filter=all"),
  ]);
  const hasRoom = plans.length < MAX_GOALS_PER_TIMELINE;
  const showHeaderAction = period === "custom" && plans.length > 0 && hasRoom;
  const tasksByGoal = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.goal_id) continue;
    const group = tasksByGoal.get(task.goal_id) ?? [];
    group.push(task);
    tasksByGoal.set(task.goal_id, group);
  }

  return (
    <>
      <Topbar title="Goals" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-3xl w-full mx-auto">
        <PageHeader
          title="Goals"
          description="A timeline you can finish."
          action={showHeaderAction ? <CreatePlanDialog period="custom" /> : undefined}
        />

        <div className="mb-6">
          <PlanPeriodTabs active={period} />
        </div>

        {period !== "custom" && (
          <Card className="mb-4">
            <CardContent className="p-2">
              <GoalPlanInput period={period} disabled={!hasRoom} />
            </CardContent>
          </Card>
        )}

        {plans.length === 0 ? (
          <EmptyState
            icon={<Target className="h-8 w-8" />}
            title={
              period === "custom"
                ? "No custom goals yet"
                : `No goal for ${periodNoun(period)} yet`
            }
            description={
              period === "custom"
                ? "Pick a start and end date. Build the steps once, work the goal."
                : "Add a goal above, then add tasks under it."
            }
            action={
              period === "custom" && hasRoom ? <CreatePlanDialog period={period} /> : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} tasks={tasksByGoal.get(p.id) ?? []} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function periodNoun(p: PeriodType): string {
  switch (p) {
    case "week":
      return "this week";
    case "month":
      return "this month";
    case "year":
      return "this year";
    case "decade":
      return "the next decade";
    default:
      return "this period";
  }
}
