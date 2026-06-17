"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Target, Sparkles, NotebookPen, ShieldCheck } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { User } from "@/lib/types";
import { UserMenu } from "./user-menu";

const NAV = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/habits", label: "Habits", icon: Sparkles },
  { href: "/reflect", label: "Journal", icon: NotebookPen },
] as const;

interface NavContentProps {
  user: User;
  onNavigate?: () => void;
}

export function NavContent({ user, onNavigate }: NavContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 h-14 flex items-center">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-accent" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Profectus</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
                "transition-colors duration-200 ease-soft",
                active
                  ? "bg-subtle text-fg font-medium"
                  : "text-muted hover:text-fg hover:bg-subtle/60",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              {label}
            </Link>
          );
        })}

        {user.role === "admin" && (
          <>
            <div className="h-px bg-border my-3 mx-3" />
            <Link
              href="/admin/users"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
                "transition-colors duration-200 ease-soft",
                pathname.startsWith("/admin")
                  ? "bg-subtle text-fg font-medium"
                  : "text-muted hover:text-fg hover:bg-subtle/60",
              )}
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
              Admin
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-border">
        <UserMenu user={user}>
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-subtle/60 ring-focus transition-colors">
            <div className="h-8 w-8 rounded-full bg-subtle text-xs font-medium flex items-center justify-center text-fg">
              {getInitials(user.email)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm truncate">{user.email}</div>
              <div className="text-xs text-muted capitalize">{user.role}</div>
            </div>
          </button>
        </UserMenu>
      </div>
    </div>
  );
}
