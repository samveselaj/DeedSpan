"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { User } from "@/lib/types";
import { WORKSPACE_NAV } from "./navigation";
import { UserMenu } from "./user-menu";

interface NavContentProps {
  user: User;
  onNavigate?: () => void;
}

export function NavContent({ user, onNavigate }: NavContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-[30px] pt-[30px] pb-[42px] flex items-center">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 ring-focus rounded-lg">
          <div className="h-7 w-7 rounded-lg bg-accent text-accent-fg flex items-center justify-center">
            <span className="font-serif text-base">D</span>
          </div>
          <span className="text-[17px] font-bold tracking-[-0.04em]">DeedSpan</span>
        </Link>
      </div>

      <div className="px-[30px] pb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Workspace</div>
      <nav aria-label="Workspace" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-[18px] pb-5">
        {WORKSPACE_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] ring-focus",
                "transition-colors duration-200 ease-soft",
                active
                  ? "bg-subtle text-fg font-medium"
                  : "text-muted hover:text-fg hover:bg-subtle/60",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
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
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] ring-focus",
                "transition-colors duration-200 ease-soft",
                pathname.startsWith("/admin")
                  ? "bg-subtle text-fg font-medium"
                  : "text-muted hover:text-fg hover:bg-subtle/60",
              )}
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
              Admin
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-border">
        <UserMenu user={user}>
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-subtle/60 ring-focus transition-colors">
            <div className="h-8 w-8 rounded-full bg-sage/30 text-xs font-medium flex items-center justify-center text-fg">
              {getInitials(user.email)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-semibold truncate">{user.email}</div>
              <div className="text-[10px] text-muted capitalize">{user.role}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </button>
        </UserMenu>
      </div>
    </div>
  );
}
