import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EventShell from "@/components/event/EventShell";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export default async function CompanyAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(EVENT_SESSION_COOKIE)?.value;
  const session = token ? verifyEventSession(token) : null;

  if (!session || session.role !== "company") {
    redirect(`/${locale}/event/company/access`);
  }

  return (
    <EventShell role="company" locale={locale}>
      {children}
    </EventShell>
  );
}
