import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SESSION_COOKIE, signSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body: { key?: string } = await request.json();
    const raw = body.key?.trim().toUpperCase();

    if (!raw) {
      return Response.json({ error: "Access key is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("access_keys")
      .select("booking_id, expires_at")
      .eq("key", raw)
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Invalid access key" }, { status: 401 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return Response.json({ error: "This access key has expired" }, { status: 401 });
    }

    const token = signSession({
      booking_id: data.booking_id,
      expires_at: data.expires_at,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // No maxAge — browser session cookie; key expiry enforced server-side via verifySession
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("verify-access-key error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
