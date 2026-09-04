"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { dashboardNavigation } from "@/lib/routes";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <Logo className="dashboard-logo" />
      <nav aria-label="Console navigation">
        {dashboardNavigation.map((item) => (
          <Link
            className={cn(
              "dashboard-nav-item",
              isActive(pathname, item.href) && "dashboard-nav-item-active",
            )}
            href={item.href}
            key={item.href}
          >
            <Icon name={item.icon} width={18} height={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span className="sidebar-status" />
        <div>
          <strong>Protected API</strong>
          <span>Test Mode operations</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const items = dashboardNavigation.slice(0, 5);

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary console navigation">
      {items.map((item) => (
        <Link
          className={cn(
            isActive(pathname, item.href) && "mobile-bottom-nav-active",
          )}
          href={item.href}
          key={item.href}
        >
          <Icon name={item.icon} width={19} height={19} />
          <span>{item.label.replace(" protection", "")}</span>
        </Link>
      ))}
    </nav>
  );
}
