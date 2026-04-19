import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  socialMediaUrl: string;
  scheduledAt: string; // ISO UTC timestamp for the chosen slot
}

export async function POST(request: NextRequest) {
  try {
    const body: FormData = await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.scheduledAt) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate scheduledAt is a valid ISO timestamp in the future
    const scheduledDate = new Date(body.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return Response.json(
        { error: "Invalid or past scheduled time" },
        { status: 400 },
      );
    }

    // Check the slot is not already taken
    const supabaseCheck = await createClient();
    const { count } = await supabaseCheck
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .eq("scheduled_at", body.scheduledAt);
    if (count && count > 0) {
      return Response.json(
        { error: "This slot is no longer available" },
        { status: 409 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Insert into Supabase
    const { error: supabaseError } = await supabase
      .from("booking_requests")
      .insert([
        {
          first_name: body.firstName,
          last_name: body.lastName,
          email: body.email,
          company_name: body.companyName,
          social_media_url: body.socialMediaUrl,
          scheduled_at: body.scheduledAt,
        },
      ]);

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      return Response.json(
        { error: "Failed to save to database" },
        { status: 500 },
      );
    }

    return Response.json(
      { message: "Demo request submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
