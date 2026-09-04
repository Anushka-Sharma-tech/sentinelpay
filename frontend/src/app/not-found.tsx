import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="system-page">
      <div className="system-card">
        <Logo />
        <p className="eyebrow">404 / Not found</p>
        <h1>That risk view does not exist.</h1>
        <p>
          The route may have changed, or the demonstration record may not be
          available.
        </p>
        <Link className="button" href={routes.home}>
          Return to SentinelPay
        </Link>
      </div>
    </main>
  );
}
