import BookingsClient from "@/components/common/admin/client";
import AdminShell from "@/components/common/admin/shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminPage(locale);

  const supabase = createAdminClient();

  const [{ data: bookings, error }, { data: accessKeys, error: keysError }] =
    await Promise.all([
      supabase
        .from("booking_requests")
        .select(
          "id, created_at, first_name, last_name, email, phone_number, country_code, company_name, company_id, social_media_url, status, scheduled_at",
        )
        .order("created_at", { ascending: false }),
      supabase.from("access_keys").select("booking_id, key, expires_at"),
    ]);

  console.log("keysError:", keysError);

  if (error) {
    console.error("Error fetching bookings:", error);
    return <p>Error loading bookings.</p>;
  }

  const keysByBookingId = Object.fromEntries(
    (accessKeys ?? []).map((k) => [
      k.booking_id,
      { key: k.key, expires_at: k.expires_at },
    ]),
  );

  const initialBookings = (bookings ?? []).map((b) => ({
    ...b,
    access_keys: keysByBookingId[b.id] ? [keysByBookingId[b.id]] : null,
  }));

  return (
    <AdminShell locale={locale}>
      <BookingsClient initialBookings={initialBookings} />
    </AdminShell>
  );
}
