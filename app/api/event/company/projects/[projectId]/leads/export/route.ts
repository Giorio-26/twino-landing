import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
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

  const upstream = await fetch(
    `${apiUrl}/event/companies/${companyId}/projects/${projectId}/leads/export`,
    {
      headers: apiKey ? { "X-API-KEY": apiKey } : {},
      cache: "no-store",
    },
  ).catch(() => null);

  if (!upstream?.ok) {
    console.error("[company/projects/leads/export GET] upstream error:", upstream?.status);
    return Response.json(
      { error: "Failed to export leads" },
      { status: upstream?.status ?? 503 },
    );
  }

  const csv = await upstream.text();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-project-${projectId}.csv"`,
    },
  });
}
