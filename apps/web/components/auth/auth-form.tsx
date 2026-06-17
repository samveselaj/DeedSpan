"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type Values = z.infer<typeof schema>;

interface Props {
  mode: "login" | "register";
}

const DEMO_ADMIN = { email: "smoke@test.dev", password: "correcthorse" };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isRegister = mode === "register";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    try {
      await api(isRegister ? "/auth/register" : "/auth/login", {
        method: "POST",
        json: values,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="rounded-2xl border border-border bg-surface shadow-soft p-6 sm:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </form>

        {!isRegister && (
          <div className="mt-5 pt-5 border-t border-border/70">
            <div className="rounded-xl bg-subtle/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted mb-2">
                <KeyRound className="h-3 w-3" />
                Demo admin
              </div>
              <div className="grid gap-0.5 font-mono text-xs text-fg/85">
                <span className="select-all">{DEMO_ADMIN.email}</span>
                <span className="select-all">{DEMO_ADMIN.password}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted mt-6">
        {isRegister ? "Already have an account? " : "New here? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="text-fg font-medium hover:underline underline-offset-4"
        >
          {isRegister ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
