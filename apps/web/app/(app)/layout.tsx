import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandBar } from "@/components/app/command-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <MobileNav user={user} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
      <CommandBar />
    </div>
  );
}
