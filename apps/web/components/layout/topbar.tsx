"use client";
import * as React from "react";
import { ChevronRight, Menu, Plus } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MOBILE_NAV_OPEN_EVENT } from "./mobile-nav";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-[62px] md:h-[72px] border-b border-border bg-bg/80 backdrop-blur flex items-center justify-between px-[18px] lg:px-12">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => window.dispatchEvent(new Event(MOBILE_NAV_OPEN_EVENT))}
          aria-label="Open navigation"
          className="md:hidden h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-lg text-fg hover:bg-subtle ring-focus transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-xs text-muted min-w-0">
          <span className="hidden sm:inline">Workspace</span>
          <ChevronRight className="hidden sm:block h-3 w-3" />
          <span className="font-semibold text-fg truncate">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.dispatchEvent(new Event("deedspan:command-open"))}
          aria-label="Quick add task or navigate"
          className="flex items-center gap-2 h-9 px-3 rounded-lg border border-accent bg-accent text-xs font-semibold text-accent-fg hover:bg-accent/90 ring-focus transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick add</span>
          <kbd className="ml-1 text-[10px] tracking-wider text-accent-fg/80 hidden lg:inline">⌘K</kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
