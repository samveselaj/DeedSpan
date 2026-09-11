import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <Link href="/" className="flex items-center gap-2 mb-10 animate-fade-in">
        <div className="h-7 w-7 rounded-lg bg-accent text-accent-fg flex items-center justify-center">
          <span className="font-serif text-base">D</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">DeedSpan</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
