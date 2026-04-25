import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { EVENT_SESSION_COOKIE, signEventSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: { key?: string } = await request.json();
    const raw = body.key?.trim().toUpperCase();

    if (!raw) {
      return Response.json({ error: "Access key is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("event_access_keys")
      .select("id, entity_name, expires_at")
      .eq("key", raw)
      .eq("role", "organizer")
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Invalid access key" }, { status: 401 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return Response.json({ error: "This access key has expired" }, { status: 401 });
    }

    const { data: existingLog } = await supabase
      .from("event_key_audit_logs")
      .select("id")
      .eq("key", raw)
      .maybeSingle();

    if (!existingLog) {
      await supabase.from("event_key_audit_logs").insert({
        event_key_id: data.id,
        key: raw,
        entity: data.entity_name ?? "Property Georgia",
        role: "organizer",
        company_id: null,
        ip_address: getClientIp(request),
        terms_accepted: false,
      });
    }

    const sessionExpiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    const token = signEventSession({
      role: "organizer",
      expires_at: sessionExpiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set(EVENT_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("verify-organizer-key error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
