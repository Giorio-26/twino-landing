import { cookies } from "next/headers";
import { EVENT_SESSION_COOKIE, verifyEventSession } from "@/lib/session";

export async function GET() {
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
    console.error("[company/projects GET] upstream error:", upstream?.status);
    return Response.json(
      { error: "Failed to fetch projects" },
      { status: upstream?.status ?? 502 },
    );
  }

  const raw = await upstream.json();
  return Response.json({
    data: raw.projects ?? [],
    company_name: raw.company_name ?? null,
    count: raw.count ?? 0,
  });
}
