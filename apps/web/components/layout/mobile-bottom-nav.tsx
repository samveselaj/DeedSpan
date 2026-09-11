"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WORKSPACE_NAV } from "./navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile workspace" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-surface/95 px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-soft backdrop-blur-md md:hidden">
      {WORKSPACE_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={cn("ring-focus flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] transition-colors", active ? "text-accent" : "text-muted hover:text-fg")}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
