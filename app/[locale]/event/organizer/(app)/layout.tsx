import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EventShell from "@/components/event/EventShell";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export default async function OrganizerAppLayout({
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

  if (!session || session.role !== "organizer") {
    redirect(`/${locale}/event/organizer/access`);
  }

  return (
    <EventShell role="organizer" locale={locale}>
      {children}
    </EventShell>
  );
}
