import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getCompanyId, missingEnv, noCompany, unauthorized } from "../_lib";
import { backendAuthorizationHeaders } from "@/lib/backend-auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return unauthorized();

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiKey || !apiUrl) return missingEnv();

  const companyId = await getCompanyId(session.booking_id);
  if (!companyId) return noCompany();

  const body = await req.json();

  const upstream = await fetch(`${apiUrl}/company/${companyId}/base`, {
    method: "PATCH",
    headers: { ...backendAuthorizationHeaders(String(companyId)), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error("[configure/base] upstream error:", upstream?.status, detail);
  }

  return Response.json({ ok: true });
}
