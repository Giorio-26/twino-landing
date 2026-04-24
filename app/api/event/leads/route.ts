import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(EVENT_SESSION_COOKIE)?.value;
  const session = token ? verifyEventSession(token) : null;

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_EVENT_URL;
  if (!apiUrl) {
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);

  let companyId: number | null = null;
  if (session.role === "company") {
    companyId = session.company_id ?? null;
  } else if (session.role === "organizer") {
    const param = searchParams.get("companyId");
    companyId = param ? Number(param) : null;
  }

  if (!companyId) {
    return Response.json({ error: "companyId is required" }, { status: 400 });
  }

  const upstreamUrl = new URL(`${apiUrl}/leads`);
  upstreamUrl.searchParams.set("company_id", String(companyId));
  const readiness = searchParams.get("readiness");
  const search = searchParams.get("search");
  if (readiness) upstreamUrl.searchParams.set("readiness", readiness);
  if (search) upstreamUrl.searchParams.set("search", search);

  const upstream = await fetch(upstreamUrl.toString(), {
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error(
      "[event/leads GET] upstream error:",
      upstream?.status,
      detail,
    );
    return Response.json(
      { error: "Failed to fetch leads" },
      { status: upstream?.status ?? 502 },
    );
  }

  const raw = await upstream.json();
  return Response.json({
    data: raw.leads ?? [],
    company_name: raw.company_name ?? null,
    count: raw.count ?? 0,
  });
}
