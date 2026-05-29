import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from("booking_requests")
    .select("company_id")
    .eq("id", session.booking_id)
    .single();

  if (!booking?.company_id) {
    return Response.json({ error: "No company linked to this account" }, { status: 400 });
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, phone")
    .eq("id", booking.company_id)
    .single();

  if (!company?.phone) {
    return Response.json({ error: "Phone number is required. Add it in Settings first." }, { status: 400 });
  }

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiKey || !apiUrl) {
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const form = new FormData();
  form.append("company_id", String(company.id));
  form.append("agency_name", company.name);
  form.append("phone", company.phone);

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/company/setup-company`, {
      method: "POST",
      headers: { "X-API-KEY": apiKey },
      body: form,
    });
  } catch (err) {
    console.error("[whatsapp/connect] upstream fetch failed:", err);
    return Response.json({ error: "Could not reach WhatsApp API" }, { status: 503 });
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    console.error("[whatsapp/connect] upstream error:", upstream.status, text);
    return Response.json({ error: "WhatsApp API returned an error", detail: text }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null) as { base64?: string } | null;

  if (!data?.base64) {
    console.error("[whatsapp/connect] unexpected response shape:", data);
    return Response.json({ error: "No QR code returned", detail: data }, { status: 503 });
  }

  const qr = data.base64.startsWith("data:")
    ? data.base64
    : `data:image/png;base64,${data.base64}`;

  return Response.json({ qr });
}
