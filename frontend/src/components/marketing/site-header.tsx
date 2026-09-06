"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { publicNavigation, routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/browser";

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    if (!supabase) {
      return;
    }

    const client = supabase;
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await client.auth.getUser();

      if (mounted) {
        setSignedIn(Boolean(user));
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSignedIn(Boolean(session?.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    setSignedIn(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

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
          {signedIn ? (
            <button
              className="text-link"
              type="button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          ) : (
            <Link className="text-link" href={routes.signIn}>
              Sign in
            </Link>
          )}

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
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {signedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          ) : (
            <Link
              href={routes.signIn}
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          )}

          <Link
            href={routes.dashboard}
            onClick={() => setOpen(false)}
          >
            Open console
          </Link>
        </nav>
      )}
    </header>
  );
}