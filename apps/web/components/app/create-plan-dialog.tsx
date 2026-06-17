"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import type { PeriodType } from "@/lib/types";

const PRESET_TITLES: Record<Exclude<PeriodType, "custom">, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
  decade: "Next 10 Years",
};

const baseSchema = z.object({
  title: z.string().min(1).max(200),
});

const customSchema = baseSchema.extend({
  period_start: z.string().min(1, "Start date required"),
  period_end: z.string().min(1, "End date required"),
});

type PresetValues = z.infer<typeof baseSchema>;
type CustomValues = z.infer<typeof customSchema>;

export function CreatePlanDialog({
  period,
  trigger,
}: {
  period: PeriodType;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isCustom = period === "custom";

  const schema = isCustom ? customSchema : baseSchema;
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PresetValues | CustomValues>({
    resolver: zodResolver(schema),
    defaultValues: isCustom
      ? ({ title: "", period_start: today, period_end: "" } as CustomValues)
      : ({ title: PRESET_TITLES[period as Exclude<PeriodType, "custom">] } as PresetValues),
  });

  async function onSubmit(values: PresetValues | CustomValues) {
    try {
      const body: Record<string, unknown> = {
        period_type: period,
        title: values.title,
      };
      if (isCustom) {
        const v = values as CustomValues;
        body.period_start = v.period_start;
        body.period_end = v.period_end;
      }
      await api("/goal-plans", { method: "POST", json: body });
      toast.success("Goal created");
      reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCustom ? "New custom goal" : `New ${labelFor(period)} goal`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={
                isCustom
                  ? "e.g. Q3 launch sprint"
                  : `e.g. ${PRESET_TITLES[period as Exclude<PeriodType, "custom">]}`
              }
              autoFocus
              {...register("title")}
            />
            {"title" in errors && errors.title && (
              <p className="text-xs text-danger">{errors.title.message as string}</p>
            )}
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="period_start">Start</Label>
                <Input
                  id="period_start"
                  type="date"
                  {...(register as (name: "period_start") => Record<string, unknown>)("period_start")}
                />
                {"period_start" in errors && errors.period_start && (
                  <p className="text-xs text-danger">
                    {(errors as Record<string, { message?: string }>)["period_start"]?.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="period_end">End</Label>
                <Input
                  id="period_end"
                  type="date"
                  {...(register as (name: "period_end") => Record<string, unknown>)("period_end")}
                />
                {"period_end" in errors && errors.period_end && (
                  <p className="text-xs text-danger">
                    {(errors as Record<string, { message?: string }>)["period_end"]?.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-muted leading-relaxed">
            {periodHelp(period)}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function labelFor(p: PeriodType): string {
  switch (p) {
    case "week":
      return "weekly";
    case "month":
      return "monthly";
    case "year":
      return "yearly";
    case "decade":
      return "10-year";
    default:
      return "";
  }
}

function periodHelp(p: PeriodType): string {
  switch (p) {
    case "week":
      return "Spans the current Monday through Sunday. One per week.";
    case "month":
      return "Spans the current calendar month. One per month.";
    case "year":
      return "Spans January 1 through December 31 of the current year.";
    case "decade":
      return "Spans the current year through ten years from now.";
    case "custom":
      return "Pick any start and end date. You can have multiple custom goals.";
  }
}
