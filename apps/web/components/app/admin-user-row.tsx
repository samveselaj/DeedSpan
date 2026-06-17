"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export function AdminUserRow({ user }: { user: User }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function update(patch: Partial<{ role: "user" | "admin"; is_disabled: boolean }>) {
    setPending(true);
    try {
      await api(`/admin/users/${user.id}`, { method: "PATCH", json: patch });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-subtle/40 transition-colors">
      <td className="py-3 px-4">
        <div className="text-sm">{user.email}</div>
        <div className="text-xs text-muted mt-0.5">
          Joined {new Date(user.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant={user.role === "admin" ? "accent" : "muted"} className="capitalize">
          {user.role}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge variant={user.is_disabled ? "danger" : "success"}>
          {user.is_disabled ? "Disabled" : "Active"}
        </Badge>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="inline-flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => update({ role: user.role === "admin" ? "user" : "admin" })}
          >
            {user.role === "admin" ? "Demote" : "Promote"}
          </Button>
          <Button
            variant={user.is_disabled ? "secondary" : "ghost"}
            size="sm"
            disabled={pending}
            onClick={() => update({ is_disabled: !user.is_disabled })}
          >
            {user.is_disabled ? "Enable" : "Disable"}
          </Button>
        </div>
      </td>
    </tr>
  );
}
