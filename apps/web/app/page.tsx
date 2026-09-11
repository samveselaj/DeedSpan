import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent text-accent-fg flex items-center justify-center">
            <span className="font-serif text-base">D</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">DeedSpan</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Calm productivity
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
            A quieter way to get things done.
          </h1>
          <p className="mt-5 text-muted text-base leading-relaxed">
            Goals, tasks, habits, and a journal — in one calm space. No clutter,
            no noise, no nudging. Just the work that matters.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-xs text-muted text-center">
        Built with care.
      </footer>
    </div>
  );
}
