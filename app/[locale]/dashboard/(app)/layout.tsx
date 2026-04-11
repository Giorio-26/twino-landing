import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
