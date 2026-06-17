import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <MobileNav user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        {children}
      </div>
    </div>
  );
}
