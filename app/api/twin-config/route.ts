import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = [
  "twin_name",
  "welcome_message",
  "tone",
  "agency_name",
  "agency_address",
  "agency_working_hours",
  "agency_phone",
  "agency_website",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

/** GET /api/twin-config — fetch the company's twin configuration */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("twin_configurations")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[twin-config GET]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

/** PUT /api/twin-config — upsert any subset of allowed fields */
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
    return Response.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("twin_configurations")
    .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    console.error("[twin-config PUT]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
