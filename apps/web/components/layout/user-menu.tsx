"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export function UserMenu({ user, children }: { user: User; children: React.ReactNode }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    try {
      await api("/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Logout failed");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Toggle theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
