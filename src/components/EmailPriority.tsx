import { EmailBadge } from "./EmailBadge.js";

export interface EmailPriorityProps {
  priority?: "high" | "normal" | "low";
}

export function EmailPriority({ priority = "normal" }: EmailPriorityProps) {
  if (priority === "normal") return null;
  return (
    <EmailBadge tone={priority === "high" ? "high" : "default"}>
      {priority === "high" ? "High priority" : "Low priority"}
    </EmailBadge>
  );
}
