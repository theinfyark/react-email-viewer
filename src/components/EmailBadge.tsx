import type { ReactNode } from "react";

export interface EmailBadgeProps {
  children: ReactNode;
  tone?: "default" | "high";
  className?: string;
}

export function EmailBadge({ children, tone = "default", className }: EmailBadgeProps) {
  return (
    <span
      className={[
        "rev-badge",
        tone === "high" ? "rev-badge-high" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
