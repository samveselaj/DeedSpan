import { LayoutGrid, ListTodo, Target, Flame, BookOpen } from "lucide-react";

export const WORKSPACE_NAV = [
  { href: "/dashboard", label: "Today", icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/reflect", label: "Journal", icon: BookOpen },
] as const;
