import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/twin-config/rules — list all guardian rules for the current user */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("guardian_rules")
    .select("id, rule_text, sort_order, created_at")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[rules GET]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

/** POST /api/twin-config/rules — add a new guardian rule */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const ruleText = body.rule_text?.trim();

  if (!ruleText) {
    return Response.json({ error: "rule_text is required" }, { status: 400 });
  }

  // Compute next sort_order
  const { data: last } = await supabase
    .from("guardian_rules")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (last?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("guardian_rules")
    .insert({ user_id: user.id, rule_text: ruleText, sort_order })
    .select("id, rule_text, sort_order, created_at")
    .single();

  if (error) {
    console.error("[rules POST]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data }, { status: 201 });
}
