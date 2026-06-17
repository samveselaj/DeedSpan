"use client";
import * as React from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import type { JournalEntry } from "@/lib/types";

interface Props {
  initialEntry: JournalEntry;
}

type JournalField = Exclude<keyof JournalEntry, "date" | "updated_at">;

const JOURNAL_FIELDS: Array<{ name: JournalField; label: string; minHeight: string }> = [
  { name: "what_i_did_today", label: "What I did today", minHeight: "min-h-[110px]" },
  {
    name: "what_i_planned_but_did_not_do",
    label: "What I planned but did not do",
    minHeight: "min-h-[110px]",
  },
  { name: "why_i_did_not_do_it", label: "Why I did not do it", minHeight: "min-h-[96px]" },
  { name: "what_i_learned", label: "What I learned", minHeight: "min-h-[96px]" },
  { name: "what_confused_me", label: "What confused me", minHeight: "min-h-[96px]" },
  {
    name: "what_i_should_do_tomorrow",
    label: "What I should do tomorrow",
    minHeight: "min-h-[110px]",
  },
  { name: "one_thing_to_improve", label: "One thing to improve", minHeight: "min-h-[96px]" },
  { name: "notes", label: "Additional notes", minHeight: "min-h-[120px]" },
];

function fieldsFromEntry(entry: JournalEntry): Record<JournalField, string> {
  return {
    what_i_did_today: entry.what_i_did_today ?? "",
    what_i_planned_but_did_not_do: entry.what_i_planned_but_did_not_do ?? "",
    why_i_did_not_do_it: entry.why_i_did_not_do_it ?? "",
    what_i_learned: entry.what_i_learned ?? "",
    what_confused_me: entry.what_confused_me ?? "",
    what_i_should_do_tomorrow: entry.what_i_should_do_tomorrow ?? "",
    one_thing_to_improve: entry.one_thing_to_improve ?? "",
    notes: entry.notes ?? "",
  };
}

function hasEntryContent(entry: JournalEntry) {
  return JOURNAL_FIELDS.some(({ name }) => entry[name].trim().length > 0);
}

function formatLastUpdated(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ReflectionEditor({ initialEntry }: Props) {
  const [day, setDay] = React.useState(initialEntry.date);
  const [fields, setFields] = React.useState(() => fieldsFromEntry(initialEntry));
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(
    hasEntryContent(initialEntry) ? initialEntry.updated_at : null,
  );
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const initial = React.useRef(fieldsFromEntry(initialEntry));

  const dirty = React.useMemo(
    () => JOURNAL_FIELDS.some(({ name }) => fields[name] !== initial.current[name]),
    [fields],
  );

  async function loadEntry(nextDay: string) {
    if (dirty && !window.confirm("You have unsaved changes. Change dates anyway?")) {
      return;
    }
    setDay(nextDay);
    setLoading(true);
    setSavedAt(null);
    try {
      const entry = await api<JournalEntry>(`/reflections/${nextDay}`);
      const nextFields = fieldsFromEntry(entry);
      setFields(nextFields);
      initial.current = nextFields;
      setLastUpdated(hasEntryContent(entry) ? entry.updated_at : null);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not load journal entry");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const entry = await api<JournalEntry>(`/reflections/${day}`, {
        method: "PUT",
        json: fields,
      });
      const nextFields = fieldsFromEntry(entry);
      setFields(nextFields);
      initial.current = nextFields;
      setLastUpdated(entry.updated_at);
      setSavedAt(new Date());
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="max-w-xs space-y-2">
        <Label htmlFor="journal-date">Date</Label>
        <Input
          id="journal-date"
          type="date"
          value={day}
          onChange={(event) => void loadEntry(event.target.value)}
          disabled={loading || saving}
        />
      </div>

      {!loading && !lastUpdated && !dirty && (
        <div className="rounded-xl border border-dashed border-border bg-subtle/35 px-4 py-3 text-sm text-muted">
          No entry saved for this day yet.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {JOURNAL_FIELDS.map(({ name, label, minHeight }) => (
          <div key={name} className={name === "notes" ? "space-y-2 lg:col-span-2" : "space-y-2"}>
            <Label htmlFor={name}>{label}</Label>
            <Textarea
              id={name}
              value={fields[name]}
              onChange={(event) =>
                setFields((current) => ({ ...current, [name]: event.target.value }))
              }
              disabled={loading || saving}
              className={minHeight}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-xs text-muted">
          {saving
            ? "Saving..."
            : savedAt
              ? `Saved at ${savedAt.toLocaleTimeString()}`
              : lastUpdated
                ? `Last updated ${formatLastUpdated(lastUpdated)}`
                : ""}
        </div>
        <Button type="button" onClick={() => void save()} disabled={loading || saving || !dirty}>
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
