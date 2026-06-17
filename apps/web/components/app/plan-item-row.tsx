"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PlanItem } from "@/lib/types";

export function PlanItemRow({ item }: { item: PlanItem }) {
  const router = useRouter();
  const [done, setDone] = React.useState(!!item.completed_at);

  async function toggle() {
    const next = !done;
    setDone(next);
    try {
      await api(`/goal-plan-items/${item.id}`, {
        method: "PATCH",
        json: { completed: next },
      });
      router.refresh();
    } catch (e) {
      setDone(!next);
      toast.error(e instanceof ApiError ? e.message : "Failed to update");
    }
  }

  async function remove() {
    try {
      await api(`/goal-plan-items/${item.id}`, { method: "DELETE" });
      toast.success("Removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <div className="group flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-subtle/60 transition-colors duration-200 ease-soft">
      <Checkbox checked={done} onCheckedChange={toggle} aria-label="Toggle complete" />
      <span
        className={cn(
          "flex-1 text-sm transition-opacity",
          done && "line-through text-muted",
        )}
      >
        {item.title}
      </span>
      <button
        onClick={remove}
        aria-label="Delete item"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger p-1 rounded-md ring-focus"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
