"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { MOBILE_NAV_OPEN_EVENT } from "./mobile-nav";

const TABS = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/metrics", label: "Metrics" },
] as const;

export function AdminTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-bg/80 backdrop-blur flex items-center justify-between gap-3 px-4 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => window.dispatchEvent(new Event(MOBILE_NAV_OPEN_EVENT))}
          aria-label="Open navigation"
          className="md:hidden h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-lg text-fg hover:bg-subtle ring-focus transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium hidden sm:inline">Admin</span>
        <nav className="flex items-center gap-1 text-sm overflow-x-auto">
          {TABS.map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
                  active ? "text-fg bg-subtle" : "text-muted hover:text-fg hover:bg-subtle",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <ThemeToggle />
    </header>
  );
}
