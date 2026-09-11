"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Home, ListChecks, Target, Sparkles, NotebookPen, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

const NAV = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/habits", label: "Habits", icon: Sparkles },
  { href: "/reflect", label: "Journal", icon: NotebookPen },
] as const;

export function CommandBar() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const trigger = () => setOpen(true);
    document.addEventListener("keydown", down);
    window.addEventListener("deedspan:command-open", trigger);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("deedspan:command-open", trigger);
    };
  }, []);

  async function quickAddTask(title: string) {
    try {
      await api("/tasks", { method: "POST", json: { title } });
      toast.success("Task added");
      router.refresh();
      setOpen(false);
      setValue("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">Quick navigation</DialogTitle>
        <Command label="Command" className="bg-surface">
          <Command.Input
            value={value}
            onValueChange={setValue}
            placeholder="Add task or jump to…"
            className="w-full h-12 px-4 text-sm bg-transparent border-b border-border outline-none placeholder:text-muted"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
              No matches
            </Command.Empty>

            {value.trim() && (
              <Command.Group heading="Create">
                <Command.Item
                  value={`__add__:${value}`}
                  onSelect={() => quickAddTask(value.trim())}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-subtle"
                >
                  <Plus className="h-4 w-4 text-accent" />
                  <span className="text-sm">
                    Add task: <span className="font-medium">{value}</span>
                  </span>
                </Command.Item>
              </Command.Group>
            )}

            <Command.Group heading="Navigate" className="text-xs text-muted">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Command.Item
                  key={href}
                  value={`nav:${label}`}
                  onSelect={() => {
                    router.push(href);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-subtle text-fg"
                >
                  <Icon className="h-4 w-4 text-muted" />
                  <span className="text-sm">{label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
