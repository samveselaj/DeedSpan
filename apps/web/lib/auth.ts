import { redirect } from "next/navigation";
import { apiServerSafe } from "./api-server";
import type { User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  return apiServerSafe<User>("/me");
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
