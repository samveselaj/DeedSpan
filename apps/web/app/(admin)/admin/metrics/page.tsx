import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { apiServer } from "@/lib/api-server";
import type { AdminMetrics } from "@/lib/types";
import { Users, Activity, ListChecks, Sparkles } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-6">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function AdminMetricsPage() {
  const m = await apiServer<AdminMetrics>("/admin/metrics");

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-5xl w-full mx-auto">
      <PageHeader title="Metrics" description="A quiet overview." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={m.user_count} icon={Users} />
        <StatCard label="Active · 7d" value={m.active_7d} icon={Activity} />
        <StatCard label="Tasks · 7d" value={m.tasks_created_7d} icon={ListChecks} />
        <StatCard label="Habits" value={m.habits_total} icon={Sparkles} />
      </div>
    </main>
  );
}
