import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getCompanyId, missingEnv, noCompany, unauthorized } from "../configure/_lib";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return unauthorized();

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiKey || !apiUrl) return missingEnv();

  const companyId = await getCompanyId(session.booking_id);
  if (!companyId) return noCompany();

  const { chat_id, message } = await request.json();
  if (!chat_id || !message) {
    return Response.json({ error: "Missing chat_id or message" }, { status: 400 });
  }

  const upstream = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ company_id: String(companyId), chat_id, message }),
  }).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error("[send-message POST] upstream error:", upstream?.status, detail);
    return Response.json({ error: "Failed to send message" }, { status: upstream?.status ?? 502 });
  }

  return Response.json({ ok: true });
}
