import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["new", "reached", "deal"] as const;
type BookingStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(request: NextRequest) {
  try {
    const body: { id: number; status: BookingStatus } = await request.json();

    if (!body.id || !VALID_STATUSES.includes(body.status)) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("booking_requests")
      .update({ status: body.status })
      .match({ id: body.id });

    if (error) {
      console.error("Error updating booking status:", error);
      return Response.json({ error: "Database update failed" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Booking status update error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
