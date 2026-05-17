import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { createTransport } from "nodemailer";
import { createAdminClient } from "@/lib/supabase/server";

// XXXX-XXXX-XXXX-XXXX  (16 uppercase hex chars split into 4 groups)
function generateAccessKey(): string {
  const hex = randomBytes(8).toString("hex").toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

function createMailTransporter() {
  return createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body: { bookingId: number; validityDays: number } = await request.json();

    if (!body.bookingId || !body.validityDays || body.validityDays < 1) {
      return Response.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const expiresAt = new Date(Date.now() + body.validityDays * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("access_keys")
      .update({ expires_at: expiresAt.toISOString() })
      .eq("booking_id", body.bookingId);

    if (error) {
      console.error("Error updating key expiry:", error);
      return Response.json({ error: "Failed to update expiry" }, { status: 500 });
    }

    return Response.json({ expiresAt: expiresAt.toISOString() }, { status: 200 });
  } catch (err) {
    console.error("update-key-expiry error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { bookingId: number; validityDays?: number } = await request.json();

    if (!body.bookingId || typeof body.bookingId !== "number") {
      return Response.json({ error: "Invalid bookingId" }, { status: 400 });
    }

    const validityDays = Math.max(1, Math.min(365, body.validityDays ?? 14));

    const supabase = createAdminClient();

    // Fetch booking to verify it's a deal and get the email
    const { data: booking, error: fetchError } = await supabase
      .from("booking_requests")
      .select("id, first_name, last_name, email, status")
      .eq("id", body.bookingId)
      .single();

    if (fetchError || !booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "deal") {
      return Response.json(
        { error: "Access keys can only be generated for deal bookings" },
        { status: 400 },
      );
    }

    const key = generateAccessKey();

    // Check if a key already exists for this booking
    const { data: existing } = await supabase
      .from("access_keys")
      .select("expires_at")
      .eq("booking_id", body.bookingId)
      .maybeSingle();

    // Preserve the original expiry on regeneration; use validityDays only on first generation
    const expiresAt = existing
      ? new Date(existing.expires_at)
      : new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    const { error: upsertError } = await supabase
      .from("access_keys")
      .upsert(
        {
          booking_id: body.bookingId,
          key,
          expires_at: expiresAt.toISOString(),
          created_at: existing ? undefined : new Date().toISOString(),
        },
        { onConflict: "booking_id" },
      );

    if (upsertError) {
      console.error("Error saving access key:", upsertError);
      return Response.json(
        { error: "Failed to save access key" },
        { status: 500 },
      );
    }

    // Send email
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const mailer = createMailTransporter();
      const expiryLabel = expiresAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: booking.email,
        subject: "Your Twino Access Key",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <h2 style="margin:0 0 8px;font-size:20px;color:#111">Hi ${booking.first_name},</h2>
            <p style="color:#555;line-height:1.6;margin:0 0 24px">
              Here is your personal access key for Twino. Keep it safe — it gives you
              access to your account setup.
            </p>
            <div style="background:#f4f4f5;border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:24px">
              <span style="font-family:monospace;font-size:22px;font-weight:700;letter-spacing:2px;color:#111">
                ${key}
              </span>
            </div>
            <p style="color:#888;font-size:13px;margin:0">
              This key is valid until <strong>${expiryLabel}</strong>.
            </p>
          </div>
        `,
      });

      emailSent = true;
    } catch (mailError) {
      emailError = mailError instanceof Error ? mailError.message : String(mailError);
      console.error("Failed to send access key email:", mailError);
    }

    return Response.json(
      { key, emailSent, emailError, expiresAt: expiresAt.toISOString() },
      { status: 200 },
    );
  } catch (err) {
    console.error("generate-access-key error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
