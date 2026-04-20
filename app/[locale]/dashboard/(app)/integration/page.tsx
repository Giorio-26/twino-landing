import { cookies } from "next/headers";
import IntegrationClient from "@/components/dashboard/IntegrationClient";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

async function getHasPhone(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return false;

  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from("booking_requests")
    .select("company_id")
    .eq("id", session.booking_id)
    .single();

  if (!booking?.company_id) return false;

  const { data: company } = await supabase
    .from("companies")
    .select("phone")
    .eq("id", booking.company_id)
    .single();

  return !!company?.phone;
}

export default async function IntegrationPage() {
  const hasPhone = await getHasPhone();

  return <IntegrationClient hasPhone={hasPhone} />;
}
