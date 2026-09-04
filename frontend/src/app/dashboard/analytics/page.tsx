import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { getAnalyticsSnapshot } from "@/lib/adapters/analytics";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsSnapshot();
  return (
    <>
      <PageHeader
        eyebrow="Demonstration analytics"
        title="Analytics"
        description="Illustrative views of how operational risk data could be summarized once a production analytics source is connected."
        actions={<Status level="DEMO">Demo charts</Status>}
      />
      <div className="overview-banner">
        <div>
          <strong>These charts are not production metrics</strong>
          <p>
            Values below are visual demonstration fixtures behind an adapter
            boundary. They do not represent users, merchants, savings, or model
            performance.
          </p>
        </div>
      </div>
      <div className="analytics-layout">
        <section className="panel">
          <div className="panel-header">
            <h2>Illustrative event volume and escalations</h2>
            <span className="demo-label"><span /> Demonstration</span>
          </div>
          <div className="chart" aria-label="Demonstration bar chart">
            {analytics.weeklyActivity.map((item, index) => (
              <div className="chart-column" key={`${item.label}-${index}`}>
                <span style={{ height: `${item.events}%` }} />
                <span style={{ height: `${item.escalations}%` }} />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {analytics.weeklyActivity.map((item, index) => (
              <span key={`${item.label}-${index}`}>{item.label}</span>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-header"><h2>Illustrative risk mix</h2></div>
          <div className="distribution">
            {analytics.riskDistribution.map((item) => (
              <div className="distribution-row" key={item.label}>
                <div className="distribution-heading">
                  <span>{item.label}</span><span>{item.value}% demo share</span>
                </div>
                <div className="distribution-track">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="content-split">
        <h2>Production adapter</h2>
        <div className="prose">
          <p>
            A live implementation should source aggregate event counts,
            outcomes, reviewer actions, and calibrated evaluation results from
            dedicated backend endpoints.
          </p>
          <p>
            The UI should never derive sensitive analytics by exposing raw
            authorization credentials or unrestricted payment data to the
            browser.
          </p>
        </div>
      </section>
    </>
  );
}
