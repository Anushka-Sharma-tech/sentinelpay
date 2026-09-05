import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentUser } from "@/lib/supabase/auth";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Console" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const name =
    (user?.user_metadata.display_name as string | undefined) || "Demo operator";

  return (
    <DashboardShell
      name={name}
      email={user?.email || "demo@sentinelpay.local"}
      demoMode={!hasSupabaseConfig}
    >
      {children}

      <style>{`
        .transaction-lab {
          position: relative;
          display: grid;
          align-items: start;
          gap: 22px;
          grid-template-columns: minmax(240px, 0.42fr) minmax(0, 1.58fr);
          overflow: visible;
        }

        .transaction-lab > * {
          min-width: 0;
        }

        .analysis-preset-panel {
          position: static;
          align-self: start;
          min-height: 0;
        }

        @media (max-width: 1100px) {
          .transaction-lab {
            grid-template-columns: 240px minmax(0, 1fr);
          }
        }

        @media (max-width: 820px) {
          .transaction-lab {
            grid-template-columns: 1fr;
          }

          .analysis-preset-panel {
            position: static;
            min-height: 0;
          }
        }
      `}</style>
    </DashboardShell>
  );
}
