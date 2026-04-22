import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getCompanyId, missingEnv, noCompany, unauthorized } from "../configure/_lib";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return unauthorized();

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiKey || !apiUrl) return missingEnv();

  const companyId = await getCompanyId(session.booking_id);
  if (!companyId) return noCompany();

  const { searchParams } = new URL(request.url);
  const upstreamUrl = new URL(`${apiUrl}/leads/${companyId}`);
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  if (q) upstreamUrl.searchParams.set("q", q);
  if (status) upstreamUrl.searchParams.set("status", status);

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: { "X-API-KEY": apiKey },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error("[leads GET] upstream error:", upstream?.status, detail);
    return Response.json({ error: "Failed to fetch leads" }, { status: upstream?.status ?? 502 });
  }

  const data = await upstream.json();
  return Response.json({ data, companyId });
}
