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
    (user?.user_metadata.display_name as string | undefined) || "Anushka Sharma";

  return (
    <DashboardShell
      name={name}
      email={user?.email || "demo@sentinelpay.local"}
      demoMode={!hasSupabaseConfig}
    >
      {children}
    </DashboardShell>
  );
}
