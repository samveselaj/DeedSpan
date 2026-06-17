"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PeriodType } from "@/lib/types";

const TABS: { value: PeriodType; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "decade", label: "10 Year" },
  { value: "custom", label: "Custom" },
];

export function PlanPeriodTabs({ active }: { active: PeriodType }) {
  const router = useRouter();
  const params = useSearchParams();

  function select(value: PeriodType) {
    const next = new URLSearchParams(params);
    next.set("period", value);
    router.push(`/goals?${next.toString()}`);
  }

  return (
    <div
      role="tablist"
      aria-label="Goal period"
      className="inline-flex items-center gap-1 p-1 rounded-xl border border-border bg-subtle/60 overflow-x-auto max-w-full"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => select(tab.value)}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-lg transition-colors duration-200 ease-soft whitespace-nowrap",
              "ring-focus",
              isActive
                ? "bg-surface text-fg shadow-soft"
                : "text-muted hover:text-fg",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
