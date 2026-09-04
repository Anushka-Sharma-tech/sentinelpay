import { MarketingLayout } from "@/components/layout/marketing-layout";

export function LegalPage({
  eyebrow,
  title,
  summary,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
}) {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <header className="marketing-title">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{summary}</p>
        </header>
        {sections.map((section) => (
          <section className="content-split" key={section.title}>
            <h2>{section.title}</h2>
            <div className="prose">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </MarketingLayout>
  );
}
