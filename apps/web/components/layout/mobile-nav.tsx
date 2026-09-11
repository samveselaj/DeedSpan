"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { NavContent } from "./nav-content";

export const MOBILE_NAV_OPEN_EVENT = "deedspan:nav-open";

export function MobileNav({ user }: { user: User }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const trigger = () => setOpen(true);
    window.addEventListener(MOBILE_NAV_OPEN_EVENT, trigger);
    return () => window.removeEventListener(MOBILE_NAV_OPEN_EVENT, trigger);
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm md:hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:hidden",
            "bg-surface border-r border-border shadow-lift",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            "data-[state=open]:duration-300 data-[state=closed]:duration-200",
            "ease-soft",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <NavContent user={user} onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
