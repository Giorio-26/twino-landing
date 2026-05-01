import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getCompanyId, missingEnv, noCompany, unauthorized } from "../_lib";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return unauthorized();

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiKey || !apiUrl) return missingEnv();

  const companyId = await getCompanyId(session.booking_id);
  if (!companyId) return noCompany();

  const upstream = await fetch(`${apiUrl}/company/${companyId}/properties`, {
    headers: { "X-API-KEY": apiKey },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) {
    console.error("[configure/properties GET] upstream error:", upstream?.status);
    return Response.json({ error: "Failed to fetch properties" }, { status: upstream?.status ?? 502 });
  }

  const raw = await upstream.json();
  return Response.json({ data: Array.isArray(raw) ? raw : (raw.data ?? []) });
}

export async function PUT(req: Request) {
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

  const upstream = await fetch(`${apiUrl}/company/${companyId}/properties`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!upstream?.ok) {
    console.error("[configure/properties PUT] upstream error:", upstream?.status);
    return Response.json({ error: "Failed to update properties" }, { status: upstream?.status ?? 502 });
  }

  const raw = await upstream.json();
  return Response.json(raw);
}

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

  const form = await req.formData();

  const upstream = await fetch(`${apiUrl}/company/${companyId}/properties`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey },
    body: form,
  }).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error("[configure/properties POST] upstream error:", upstream?.status, detail);
    return Response.json({ error: "Upload failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
