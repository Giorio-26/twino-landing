import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(EVENT_SESSION_COOKIE)?.value;
  const session = token ? verifyEventSession(token) : null;

  if (!session || session.role !== "organizer") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyId } = await params;

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_EVENT_URL;
  if (!apiUrl) {
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const upstream = await fetch(
    `${apiUrl}/event/companies/${companyId}/projects`,
    {
      headers: apiKey ? { "X-API-KEY": apiKey } : {},
      cache: "no-store",
    },
  ).catch(() => null);

  if (!upstream?.ok) {
    console.error("[organizer/companies/projects GET] upstream error:", upstream?.status);
    return Response.json(
      { error: "Failed to fetch projects" },
      { status: upstream?.status ?? 503 },
    );
  }

  const raw = await upstream.json();
  return Response.json({
    data: raw.projects ?? [],
    company_name: raw.company_name ?? null,
    count: raw.count ?? 0,
  });
}
