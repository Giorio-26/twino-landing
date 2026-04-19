export const metadata = {
  title: "TwinO Dashboard",
  description:
    "AI-powered lead qualification dashboard for real estate agencies",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
