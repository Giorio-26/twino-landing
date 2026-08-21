import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  getAccessSessionSecret,
  SESSION_COOKIE,
  signSession,
} from "@/lib/session";
import { createAdminClient, createClient } from "@/lib/supabase/server";

function companyEmail(companyId: number | string): string {
  return `company-${companyId}@system.twino.app`;
}

function companyPassword(companyId: number | string): string {
  return createHmac("sha256", getAccessSessionSecret())
    .update(`company-auth:${companyId}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body: { key?: string } = await request.json();
    const raw = body.key?.trim().toUpperCase();

    if (!raw) {
      return Response.json({ error: "Access key is required" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
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

    // Resolve company_id for this booking
    const { data: booking } = await adminSupabase
      .from("booking_requests")
      .select("company_id")
      .eq("id", data.booking_id)
      .single();

    const companyId = booking?.company_id;
    if (!companyId) {
      return Response.json({ error: "No company linked to this key" }, { status: 400 });
    }

    const email = companyEmail(companyId);
    const password = companyPassword(companyId);

    // Ensure a Supabase auth user exists for this company (one per company).
    // Try sign-in first; create the user only if it doesn't exist yet.
    const userSupabase = await createClient();
    let signInResult = await userSupabase.auth.signInWithPassword({ email, password });

    if (signInResult.error) {
      // User doesn't exist yet — create it, then sign in
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { company_id: companyId },
      });
      signInResult = await userSupabase.auth.signInWithPassword({ email, password });
    }

    if (signInResult.error) {
      console.error("[verify-access-key] supabase sign-in failed:", signInResult.error);
      return Response.json({ error: "Authentication failed" }, { status: 500 });
    }

    // Set the Twino session cookie (used by Twino API routes)
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
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("verify-access-key error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}

