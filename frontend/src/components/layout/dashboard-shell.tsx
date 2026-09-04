import { DashboardTopbar } from "@/components/dashboard/topbar";
import {
  DashboardSidebar,
  MobileBottomNavigation,
} from "@/components/navigation/dashboard-navigation";

export function DashboardShell({
  children,
  name,
  email,
  demoMode,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
  demoMode: boolean;
}) {
  return (
    <div className="dashboard-shell">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardTopbar name={name} email={email} demoMode={demoMode} />
        <main className="dashboard-content">{children}</main>
      </div>
      <MobileBottomNavigation />
    </div>
  );
}
