"use client";

import { Logo } from "@/components/ui/logo";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="system-page">
      <div className="system-card">
        <Logo />
        <p className="eyebrow">Application error</p>
        <h1>This view could not be loaded.</h1>
        <p>
          No sensitive details are shown here. Retry the request or return to
          the product overview.
        </p>
        <button className="button" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
