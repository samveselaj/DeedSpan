"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { cn } from "@/lib/utils";
import type { HabitCadence } from "@/lib/types";

type FormValues = { name: string };

export function CreateHabitDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [cadence, setCadence] = React.useState<HabitCadence>("daily");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    try {
      await api("/habits", { method: "POST", json: { name: values.name, cadence } });
      toast.success("Habit added");
      reset();
      setCadence("daily");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          setCadence("daily");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Read 20 minutes"
              autoFocus
              {...register("name", { required: true, maxLength: 120 })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cadence</Label>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border bg-subtle/60 w-full">
              {(["daily", "weekly", "monthly"] as const).map((value) => {
                const active = cadence === value;
                return (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={active}
                    onClick={() => setCadence(value)}
                    className={cn(
                      "flex-1 h-9 text-xs font-medium rounded-lg ring-focus transition-colors duration-200 ease-soft capitalize",
                      active
                        ? "bg-surface text-fg shadow-soft"
                        : "text-muted hover:text-fg",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted">
              {cadence === "daily"
                ? "One completion per day."
                : cadence === "weekly"
                  ? "At least one completion per ISO week (Mon–Sun)."
                  : "At least one completion per calendar month."}
            </p>
          </div>

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
