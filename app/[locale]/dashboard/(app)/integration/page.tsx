import { cookies } from "next/headers";
import { getCompanyId } from "@/app/api/dashboard/configure/_lib";
import IntegrationClient from "@/components/dashboard/IntegrationClient";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { createAdminClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { backendAuthorizationHeaders } from "@/lib/backend-auth";

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

type ConfigReadiness = {
  personality: boolean;
  guardians: boolean;
  properties: boolean;
};

async function getConfigReadiness(): Promise<ConfigReadiness> {
  const fallback: ConfigReadiness = {
    personality: false,
    guardians: false,
    properties: false,
  };

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return fallback;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  const [configResult, rulesResult] = await Promise.all([
    supabase
      .from("twin_configurations")
      .select("twin_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("guardian_rules")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  let hasProperties = false;
  if (session) {
    const companyId = await getCompanyId(session.booking_id);
    if (companyId) {
      const apiKey = process.env.TWINO_API_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiKey && apiUrl) {
        const upstream = await fetch(
          `${apiUrl}/company/${companyId}/properties`,
          { headers: backendAuthorizationHeaders(String(companyId)), cache: "no-store" },
        ).catch(() => null);
        if (upstream?.ok) {
          const raw = await upstream.json().catch(() => null);
          const props = Array.isArray(raw) ? raw : (raw?.data ?? []);
          hasProperties = props.length > 0;
        }
      }
    }
  }

  return {
    personality: !!configResult.data?.twin_name,
    guardians: (rulesResult.count ?? 0) > 0,
    properties: hasProperties,
  };
}

export default async function IntegrationPage() {
  const [hasPhone, readiness] = await Promise.all([
    getHasPhone(),
    getConfigReadiness(),
  ]);

  const missingTabs = (
    Object.entries(readiness) as [keyof ConfigReadiness, boolean][]
  )
    .filter(([, done]) => !done)
    .map(([tab]) => tab);

  return <IntegrationClient hasPhone={hasPhone} missingTabs={missingTabs} />;
}
