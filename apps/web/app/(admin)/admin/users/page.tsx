import { Card } from "@/components/ui/card";
import { AdminUserRow } from "@/components/app/admin-user-row";
import { PageHeader } from "@/components/app/page-header";
import { apiServer } from "@/lib/api-server";
import type { User } from "@/lib/types";

export default async function AdminUsersPage() {
  const users = await apiServer<User[]>("/admin/users");

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-5xl w-full mx-auto">
      <PageHeader title="Users" description={`${users.length} total`} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-border">
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <AdminUserRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
