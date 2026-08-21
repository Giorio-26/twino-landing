import AdminShell from "@/components/common/admin/shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import EventKeysClient from "./client";

export default async function EventKeysPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminPage(locale);

  const supabase = createAdminClient();

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_EVENT_URL;

  const [companiesRaw, { data: existingKeys }, { data: auditLogs }] = await Promise.all([
    apiKey && apiUrl
      ? fetch(`${apiUrl}/event/companies`, {
          headers: { "X-API-KEY": apiKey },
          cache: "no-store",
        }).then((r) => r.json()).catch(() => [])
      : Promise.resolve([]),
    supabase
      .from("event_access_keys")
      .select("id, key, role, company_id, expires_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("event_key_audit_logs")
      .select("key, role, company_id, ip_address, terms_accepted, first_used_at"),
  ]);

  const companies = Array.isArray(companiesRaw)
    ? companiesRaw
    : Array.isArray(companiesRaw?.companies)
      ? companiesRaw.companies
      : Array.isArray(companiesRaw?.data)
        ? companiesRaw.data
        : [];

  return (
    <AdminShell locale={locale}>
      <EventKeysClient
        companies={companies}
        initialKeys={existingKeys ?? []}
        auditLogs={auditLogs ?? []}
      />
    </AdminShell>
  );
}
