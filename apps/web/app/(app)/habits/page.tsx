import { EmptyState } from "@/components/ui/empty-state";
import { HabitTile } from "@/components/app/habit-tile";
import { CreateHabitDialog } from "@/components/app/create-habit-dialog";
import { PageHeader } from "@/components/app/page-header";
import { Topbar } from "@/components/layout/topbar";
import { apiServer } from "@/lib/api-server";
import type { Habit } from "@/lib/types";
import { Sparkles } from "lucide-react";

export default async function HabitsPage() {
  const habits = await apiServer<Habit[]>("/habits");

  return (
    <>
      <Topbar title="Habits" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-3xl w-full mx-auto">
        <PageHeader
          title="Habits"
          description="Small, daily."
          action={<CreateHabitDialog />}
        />

        {habits.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="No habits yet"
            description="The compound interest of small wins."
            action={<CreateHabitDialog />}
          />
        ) : (
          <div className="grid gap-3">
            {habits.map((h) => (
              <HabitTile key={h.id} habit={h} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
