import type { RiskLevel } from "@/lib/types/risk";
import { cn } from "@/lib/utils";

export function Status({
  level,
  children,
}: {
  level: RiskLevel | "DEMO" | "NEUTRAL";
  children?: React.ReactNode;
}) {
  return (
    <span className={cn("status", `status-${level.toLowerCase()}`)}>
      {children ?? level.charAt(0) + level.slice(1).toLowerCase()}
    </span>
  );
}

export function DemoLabel({ children = "Demonstration environment" }) {
  return (
    <span className="demo-label">
      <span aria-hidden="true" />
      {children}
    </span>
  );
}
