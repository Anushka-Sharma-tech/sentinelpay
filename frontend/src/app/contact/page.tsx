import type { Metadata } from "next";

import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Contact" };

const contacts = [
  ["mail", "Email", "mailto:anushkasharmatech08@gmail.com", "anushkasharmatech08@gmail.com"],
  ["model", "GitHub", "https://github.com/Anushka-Sharma-tech", "github.com/Anushka-Sharma-tech"],
  ["user", "LinkedIn", "https://www.linkedin.com/in/anushka-sharma-a9aa07377/", "linkedin.com/in/anushka-sharma-a9aa07377"],
] as const;

export default function ContactPage() {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <header className="marketing-title">
          <p className="eyebrow">Contact</p>
          <h1>Questions, feedback, or collaboration.</h1>
          <p>
            SentinelPay is an active project. Use the verified links below to
            get in touch or review the work.
          </p>
        </header>
        <div className="contact-grid">
          {contacts.map(([icon, label, href, text]) => (
            <div className="contact-card" key={label}>
              <Icon name={icon} width={22} height={22} />
              <h2>{label}</h2>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {text}
              </a>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
