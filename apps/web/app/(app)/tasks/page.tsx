import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/app/task-row";
import { TaskInput } from "@/components/app/task-input";
import { PageHeader } from "@/components/app/page-header";
import { Topbar } from "@/components/layout/topbar";
import { apiServer } from "@/lib/api-server";
import type { GoalPlan, Task } from "@/lib/types";
import { ListChecks } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = (params.filter as "all" | "open" | "completed") ?? "open";
  const [tasks, goals] = await Promise.all([
    apiServer<Task[]>(`/tasks?filter=${filter}`),
    apiServer<GoalPlan[]>("/goal-plans"),
  ]);
  const goalTitleById = new Map(goals.map((goal) => [goal.id, goal.title]));

  return (
    <>
      <Topbar title="Tasks" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-3xl w-full mx-auto">
        <PageHeader title="Tasks" description="Capture, complete, move on." />

        <Card>
          <CardContent className="p-2">
            <TaskInput goals={goals} />
            {tasks.length === 0 ? (
              <EmptyState
                icon={<ListChecks className="h-8 w-8" />}
                title="Nothing to do"
                description="Add your first task above."
              />
            ) : (
              <div className="divide-y divide-border/60">
                {tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    goalTitle={t.goal_id ? goalTitleById.get(t.goal_id) : undefined}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
