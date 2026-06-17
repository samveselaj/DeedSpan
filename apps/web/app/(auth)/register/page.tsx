import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your space</h1>
        <p className="text-sm text-muted mt-1.5">A calm home for goals, tasks, and habits.</p>
      </div>
      <AuthForm mode="register" />
    </div>
  );
}
