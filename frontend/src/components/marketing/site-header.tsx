"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { publicNavigation, routes } from "@/lib/routes";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Logo />
        <nav className="site-nav" aria-label="Primary navigation">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          <Link className="text-link" href={routes.signIn}>
            Sign in
          </Link>
          <Link className="button button-small" href={routes.dashboard}>
            Open console
          </Link>
        </div>
        <button
          className="icon-button site-menu-button"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          <Icon name={open ? "close" : "menu"} width={20} height={20} />
        </button>
      </div>
      {open && (
        <nav className="mobile-site-nav" aria-label="Mobile navigation">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href={routes.signIn} onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link href={routes.dashboard} onClick={() => setOpen(false)}>
            Open console
          </Link>
        </nav>
      )}
    </header>
  );
}
