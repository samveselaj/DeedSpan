import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-up",
        className,
      )}
    >
      {icon && <div className="mb-4 text-muted">{icon}</div>}
      <h3 className="text-base font-medium text-fg">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
