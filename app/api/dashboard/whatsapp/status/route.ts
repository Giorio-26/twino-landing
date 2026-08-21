import { cookies } from "next/headers";
import { backendAuthorizationHeaders } from "@/lib/backend-auth";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
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
    return Response.json({ connected: false });
  }

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiKey || !apiUrl) {
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const upstream = await fetch(
      `${apiUrl}/company/${booking.company_id}/connect`,
      {
        headers: backendAuthorizationHeaders(String(booking.company_id)),
      },
    );

    // if (!upstream.ok) {
    //   return Response.json({ connected: false });
    // }

    // const data = await upstream.json() as { instance?: { state?: string } };
    // const connected = data?.instance?.state === "open";

    const data = await upstream.json();

    const connected =
      data?.status === "open" || data?.instance?.state === "open";
    const hasQr = !!data?.base64;

    return Response.json({
      connected,
      qr: hasQr ? data.base64 : null,
    });
  } catch (error) {
    return Response.json({ connected: false, error });
  }
}

