import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { getInvestigations } from "@/lib/adapters/risk";
import { routes } from "@/lib/routes";

export default async function InvestigationsPage() {
  const investigations = await getInvestigations();

  return (
    <>
      <PageHeader
        eyebrow="Analyst workflow"
        title="Investigations"
        description="Review related evidence, follow activity, and keep a clear recommended action."
        actions={<Status level="DEMO">Demo data</Status>}
      />
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Investigation</th>
              <th>Risk</th>
              <th>Status</th>
              <th>Recommended action</th>
              <th>Last activity</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {investigations.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="table-title">{item.title}</span>
                  <span className="table-subtitle mono">{item.id}</span>
                </td>
                <td><Status level={item.riskLevel} /></td>
                <td>{item.status}</td>
                <td>{item.recommendedAction}</td>
                <td>{item.lastActivity}</td>
                <td>
                  <Link className="table-link" href={routes.investigation(item.id)}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
