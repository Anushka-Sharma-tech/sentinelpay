import { Logo } from "@/components/ui/logo";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Logo />
        <div className="auth-aside-copy">
          <p className="eyebrow">SentinelPay console</p>
          <h1>Understand the risk before acting on it.</h1>
          <p>
            Review voice, context, transaction, and behavioural evidence in one
            defensive investigation workspace.
          </p>
        </div>
        <span className="auth-aside-foot">
          Under development · No live payment data connected
        </span>
      </aside>
      <main className="auth-main">
        <section className="auth-panel">
          <header className="auth-panel-header">
            <h2>{title}</h2>
            <p>{description}</p>
          </header>
          {children}
        </section>
      </main>
    </div>
  );
}
