"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";

export function PlanItemInput({ planId }: { planId: string }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value || busy) return;
    setBusy(true);
    try {
      await api(`/goal-plans/${planId}/items`, {
        method: "POST",
        json: { title: value },
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
      <Plus className="h-4 w-4 text-muted" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a step..."
        className="h-9 border-none bg-transparent shadow-none px-0 focus-visible:ring-0"
        disabled={busy}
      />
    </form>
  );
}
