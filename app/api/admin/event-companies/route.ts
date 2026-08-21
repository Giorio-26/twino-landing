import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const denial = await requireAdminApi();
  if (denial) return denial;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_companies")
    .select("id, name")
    .order("name");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data: data ?? [] });
}
