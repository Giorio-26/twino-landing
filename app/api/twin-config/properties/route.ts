import type { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const MAX_PROPERTIES = 15;

/** GET /api/twin-config/properties — list all properties for the current user */
export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("properties")
    .select("id, name, price, location, rooms, area, status, link, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[properties GET]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

/** POST /api/twin-config/properties — add a new property (max 15) */
export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Enforce max 15 properties
  const { count, error: countError } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    return Response.json({ error: countError.message }, { status: 500 });
  }

  if ((count ?? 0) >= MAX_PROPERTIES) {
    return Response.json(
      { error: `Maximum of ${MAX_PROPERTIES} properties reached` },
      { status: 400 },
    );
  }

  const body = await request.json();

  if (!body.name?.trim() || !body.location?.trim() || !body.price) {
    return Response.json(
      { error: "name, price, and location are required" },
      { status: 400 },
    );
  }

  const validStatuses = ["available", "reserved", "sold"];
  const status = validStatuses.includes(body.status)
    ? body.status
    : "available";

  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      price: Number(body.price),
      location: body.location.trim(),
      rooms: Number(body.rooms) || 1,
      area: body.area ? Number(body.area) : null,
      status,
      link: body.link?.trim() ?? "",
    })
    .select("id, name, price, location, rooms, area, status, link, created_at")
    .single();

  if (error) {
    console.error("[properties POST]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data }, { status: 201 });
}
