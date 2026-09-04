import Link from "next/link";

import { Icon } from "@/components/ui/icon";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="back-link">
      <Icon name="arrow-left" width={16} height={16} />
      {label}
    </Link>
  );
}
