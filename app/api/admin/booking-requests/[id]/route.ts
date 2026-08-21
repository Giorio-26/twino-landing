import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denial = await requireAdminApi();
  if (denial) return denial;

  try {
    const { id } = await params;
    const bookingId = Number(id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return Response.json({ error: "Invalid booking id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: booking, error: fetchError } = await supabase
      .from("booking_requests")
      .select("id, company_id")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Delete booking first (cascades access_keys via FK)
    const { error: deleteError } = await supabase
      .from("booking_requests")
      .delete()
      .eq("id", bookingId);

    if (deleteError) {
      console.error("Error deleting booking:", deleteError);
      return Response.json(
        { error: "Failed to delete booking" },
        { status: 500 },
      );
    }

    // Delete linked company if present (booking FK was SET NULL, company row still exists)
    if (booking.company_id) {
      const { error: companyDeleteError } = await supabase
        .from("companies")
        .delete()
        .eq("id", booking.company_id);

      if (companyDeleteError) {
        console.error("Error deleting company:", companyDeleteError);
        // Don't fail the request — booking is already gone
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Booking delete error:", err);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
