import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Tbilisi is GMT+4 — all slots are stored/queried as UTC
const TZ_OFFSET_HOURS = 4;
// Available slot hours in local (Tbilisi) time: 10:00 – 20:00
const SLOT_HOURS_LOCAL = Array.from({ length: 11 }, (_, i) => i + 10); // [10..20]

function slotToUtcHour(localHour: number) {
  return localHour - TZ_OFFSET_HOURS; // may be negative for <04:00 local, not our case
}

/**
 * GET /api/book-demo/availability?date=YYYY-MM-DD
 *
 * Returns the list of slot hours (in Tbilisi local time) that are already
 * booked for the given date, so the client can disable them.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }

  // Build UTC timestamp range covering all slots for this local date.
  // Earliest slot: 10:00 local → 06:00 UTC
  // Latest slot start: 20:00 local → 16:00 UTC  (session ends 21:00/17:00 UTC)
  const rangeStart = `${date}T${String(slotToUtcHour(SLOT_HOURS_LOCAL[0])).padStart(2, "0")}:00:00Z`;
  const rangeEnd = `${date}T${String(slotToUtcHour(SLOT_HOURS_LOCAL[SLOT_HOURS_LOCAL.length - 1]) + 1).padStart(2, "0")}:00:00Z`;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select("scheduled_at")
    .gte("scheduled_at", rangeStart)
    .lt("scheduled_at", rangeEnd);

  if (error) {
    console.error("Availability query error:", error);
    return Response.json({ error: "Failed to fetch availability" }, { status: 500 });
  }

  // Convert booked UTC timestamps back to local slot hours
  const bookedHours = (data ?? []).map((row) => {
    const utcHour = new Date(row.scheduled_at).getUTCHours();
    return utcHour + TZ_OFFSET_HOURS;
  });

  return Response.json({ bookedHours });
}
