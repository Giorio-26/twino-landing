import { createAdminClient } from "@/lib/supabase/server";

export async function getCompanyId(bookingId: string | number): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("company_id")
    .eq("id", bookingId)
    .single();
  return data?.company_id ?? null;
}

export function missingEnv() {
  return Response.json({ error: "Server misconfiguration" }, { status: 500 });
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function noCompany() {
  return Response.json({ error: "No company linked" }, { status: 400 });
}
