import { cookies } from "next/headers";
import SettingsClient from "@/components/dashboard/SettingsClient";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

async function getCompany() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return null;

  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from("booking_requests")
    .select("company_id")
    .eq("id", session.booking_id)
    .single();

  if (!booking?.company_id) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("name, email, phone, website")
    .eq("id", booking.company_id)
    .single();

  return company ?? null;
}

export default async function SettingsPage() {
  const company = await getCompany();

  return <SettingsClient initialCompany={company} />;
}
