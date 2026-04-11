import BookingsClient from "@/components/common/admin/client";
import { createClient } from "@/lib/supabase/server";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: booking_requests, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return <p>Error loading bookings.</p>;
  }

  return <BookingsClient initialBookings={booking_requests || []} />;
}
