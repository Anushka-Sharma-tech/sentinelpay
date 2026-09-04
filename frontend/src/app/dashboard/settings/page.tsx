import { SettingsForm } from "@/components/dashboard/settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/supabase/auth";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const name =
    (user?.user_metadata.display_name as string | undefined) || "Anushka Sharma";

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage profile details and review account security state."
      />
      <SettingsForm
        initialName={name}
        email={user?.email || "demo@sentinelpay.local"}
        verified={Boolean(user?.email_confirmed_at)}
        demoMode={!hasSupabaseConfig}
      />
    </>
  );
}
