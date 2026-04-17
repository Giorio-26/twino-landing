import BookingsClient from "@/components/common/admin/client";
import { createAdminClient } from "@/lib/supabase/server";

export default async function BookingsPage() {
  const supabase = createAdminClient();

  const [{ data: bookings, error }, { data: accessKeys, error: keysError }] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("access_keys")
      .select("booking_id, key, expires_at"),
  ]);

  console.log("[bookings page] accessKeys:", accessKeys, "keysError:", keysError);

  if (error) {
    console.error("Error fetching bookings:", error);
    return <p>Error loading bookings.</p>;
  }

  const keysByBookingId = Object.fromEntries(
    (accessKeys ?? []).map((k) => [k.booking_id, { key: k.key, expires_at: k.expires_at }]),
  );

  const initialBookings = (bookings ?? []).map((b) => ({
    ...b,
    access_keys: keysByBookingId[b.id] ? [keysByBookingId[b.id]] : null,
  }));

  return <BookingsClient initialBookings={initialBookings} />;
}
