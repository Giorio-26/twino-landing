import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(EVENT_SESSION_COOKIE)?.value;
  const session = token ? verifyEventSession(token) : null;

  if (!session || session.role !== "company") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.company_id;
  if (!companyId) {
    return Response.json({ error: "No company_id in session" }, { status: 400 });
  }

  const { projectId } = await params;

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_EVENT_URL;
  if (!apiUrl) {
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const upstreamUrl = new URL(
    `${apiUrl}/event/companies/${companyId}/projects/${projectId}/leads`,
  );
  const readiness = searchParams.get("readiness");
  const search = searchParams.get("search");
  if (readiness) upstreamUrl.searchParams.set("readiness", readiness);
  if (search) upstreamUrl.searchParams.set("search", search);

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: apiKey ? { "X-API-KEY": apiKey } : {},
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error("[company/projects/leads GET] upstream error:", upstream?.status, detail);
    return Response.json(
      { error: "Failed to fetch leads" },
      { status: upstream?.status ?? 503 },
    );
  }

  const raw = await upstream.json();
  return Response.json({
    data: raw.leads ?? [],
    company_name: raw.company_name ?? null,
    project_name: raw.project_name ?? null,
    count: raw.count ?? 0,
  });
}
