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

    // When transitioning to "deal", auto-create a company if not already linked
    if (body.status === "deal") {
      const { data: booking, error: fetchError } = await supabase
        .from("booking_requests")
        .select("id, company_name, company_id, status")
        .eq("id", body.id)
        .single();

      if (fetchError || !booking) {
        return Response.json({ error: "Booking not found" }, { status: 404 });
      }

      if (!booking.company_id) {
        const companyName = booking.company_name?.trim() || "Unknown";

        const { data: company, error: companyError } = await supabase
          .from("companies")
          .insert({ name: companyName })
          .select("id")
          .single();

        if (companyError || !company) {
          console.error("Error creating company:", companyError);
          return Response.json({ error: "Failed to create company" }, { status: 500 });
        }

        const { error } = await supabase
          .from("booking_requests")
          .update({ status: body.status, company_id: company.id })
          .eq("id", body.id);

        if (error) {
          console.error("Error updating booking:", error);
          return Response.json({ error: "Database update failed" }, { status: 500 });
        }

        return Response.json({ ok: true, company_id: company.id });
      }
    }

    const { error } = await supabase
      .from("booking_requests")
      .update({ status: body.status })
      .eq("id", body.id);

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
