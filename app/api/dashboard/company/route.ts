import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

async function getCompanyId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("company_id")
    .eq("id", session.booking_id)
    .single();

  return data?.company_id ?? null;
}

export async function GET() {
  const companyId = await getCompanyId();
  if (!companyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, email, phone, website")
    .eq("id", companyId)
    .single();

  if (error) {
    console.error("[company GET]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

const ALLOWED_FIELDS = ["name", "email", "phone", "website"] as const;
type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(request: NextRequest) {
  const companyId = await getCompanyId();
  if (!companyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updates: Partial<Record<AllowedField, string>> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)
    .select("id, name, email, phone, website")
    .single();

  if (error) {
    console.error("[company PATCH]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
