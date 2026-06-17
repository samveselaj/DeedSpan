import type { User } from "@/lib/types";
import { NavContent } from "./nav-content";

export function Sidebar({ user }: { user: User }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-bg/60 backdrop-blur">
      <NavContent user={user} />
    </aside>
  );
}
