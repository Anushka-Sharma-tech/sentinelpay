import Link from "next/link";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={routes.home}
      className={cn("brand-mark", compact && "brand-mark-compact", className)}
      aria-label="SentinelPay home"
    >
      <span className="brand-symbol" aria-hidden="true">
        <span />
      </span>
      {!compact && <span>SENTINELPAY</span>}
    </Link>
  );
}
