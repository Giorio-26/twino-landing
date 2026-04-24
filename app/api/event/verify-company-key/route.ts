import { EVENT_SESSION_COOKIE, signEventSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

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
      .select("company_id, expires_at")
      .eq("key", raw)
      .eq("role", "company")
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Invalid access key" }, { status: 401 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return Response.json({ error: "This access key has expired" }, { status: 401 });
    }

    if (!data.company_id) {
      return Response.json({ error: "No company linked to this key" }, { status: 400 });
    }

    const sessionExpiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    const token = signEventSession({
      role: "company",
      company_id: data.company_id,
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
    console.error("verify-company-key error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
