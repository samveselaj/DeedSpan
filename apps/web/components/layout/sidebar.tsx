import type { User } from "@/lib/types";
import { NavContent } from "./nav-content";

export function Sidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-0 hidden h-screen max-h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-border bg-surface/20 md:flex">
      <NavContent user={user} />
    </aside>
  );
}
