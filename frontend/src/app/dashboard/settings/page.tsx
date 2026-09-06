import { SettingsForm } from "@/components/dashboard/settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/supabase/auth";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ recovery?: string }>;
}) {
  const params = await searchParams;
  const recoveryMode = params.recovery === "1";

  const user = await getCurrentUser();

  const name =
    (user?.user_metadata.display_name as string | undefined) ||
    "Demo operator";

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title={recoveryMode ? "Set a new password" : "Settings"}
        description={
          recoveryMode
            ? "Choose a new password to restore access to your SentinelPay account."
            : "Manage profile details and review account security state."
        }
      />

      <SettingsForm
        initialName={name}
        email={user?.email || "demo@sentinelpay.local"}
        demoMode={!hasSupabaseConfig}
        recoveryMode={recoveryMode}
      />
    </>
  );
}
