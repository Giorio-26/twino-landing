import { cookies } from "next/headers";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EVENT_SESSION_COOKIE)?.value;
  const session = token ? verifyEventSession(token) : null;

  if (!session || session.role !== "organizer") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_EVENT_URL;
  if (!apiKey || !apiUrl) {
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const upstream = await fetch(`${apiUrl}/event/companies`, {
    headers: { "X-API-KEY": apiKey },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) {
    console.error("[event/companies GET] upstream error:", upstream?.status);
    return Response.json({ error: "Failed to fetch companies" }, { status: upstream?.status ?? 502 });
  }

  const raw = await upstream.json();
  const data = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.companies)
      ? raw.companies
      : Array.isArray(raw?.data)
        ? raw.data
        : [];
  return Response.json({ data });
}
