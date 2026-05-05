import type { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";

/** DELETE /api/twin-config/properties/[id] — remove a property owned by the current user */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // ensures ownership

  if (error) {
    console.error("[properties DELETE]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
