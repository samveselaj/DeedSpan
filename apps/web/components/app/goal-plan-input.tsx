"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import type { PeriodType } from "@/lib/types";

const PLACEHOLDERS: Record<Exclude<PeriodType, "custom">, string> = {
  week: "Add a goal for this week...",
  month: "Add a goal for this month...",
  year: "Add a goal for this year...",
  decade: "Add a 10-year goal...",
};

export function GoalPlanInput({
  period,
  disabled = false,
}: {
  period: Exclude<PeriodType, "custom">;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value || busy || disabled) return;
    setBusy(true);
    try {
      await api("/goal-plans", {
        method: "POST",
        json: { period_type: period, title: value },
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
    <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3">
      <Plus className="h-4 w-4 shrink-0 text-muted" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={disabled ? "20 goal limit reached for this timeline" : PLACEHOLDERS[period]}
        className="h-9 border-none bg-transparent shadow-none px-0 focus-visible:ring-0"
        disabled={busy || disabled}
      />
    </form>
  );
}
