import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { routes } from "@/lib/routes";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div>
          <Logo />
          <p>
            Explainable, multimodal risk assessment for voice-assisted payment
            fraud.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Product</strong>
            <Link href={routes.howItWorks}>How it works</Link>
            <Link href={routes.pricing}>Pricing</Link>
            <Link href={routes.dashboard}>Console</Link>
          </div>
          <div>
            <strong>Project</strong>
            <Link href={routes.about}>About</Link>
            <Link href={routes.contact}>Contact</Link>
            <a
              href="https://github.com/Anushka-Sharma-tech/sentinelpay"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
          <div>
            <strong>Legal</strong>
            <Link href={routes.privacy}>Privacy</Link>
            <Link href={routes.terms}>Terms</Link>
            <Link href={routes.refunds}>Refunds</Link>
            <Link href={routes.shipping}>Shipping</Link>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>SentinelPay is currently an under-development project.</span>
        <span>Defensive use only.</span>
      </div>
    </footer>
  );
}
