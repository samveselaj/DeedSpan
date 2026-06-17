"use client";
import * as React from "react";
import { Command, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MOBILE_NAV_OPEN_EVENT } from "./mobile-nav";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-bg/80 backdrop-blur flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => window.dispatchEvent(new Event(MOBILE_NAV_OPEN_EVENT))}
          aria-label="Open navigation"
          className="md:hidden h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-lg text-fg hover:bg-subtle ring-focus transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium text-muted truncate">{title}</div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => window.dispatchEvent(new Event("aether:command-open"))}
          aria-label="Open command bar"
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl border border-border text-xs text-muted hover:bg-subtle ring-focus transition-colors"
        >
          <Command className="h-3.5 w-3.5" />
          <span>Quick</span>
          <kbd className="ml-1 text-[10px] tracking-wider text-muted/80">⌘K</kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
