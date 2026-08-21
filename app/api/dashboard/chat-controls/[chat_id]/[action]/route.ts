import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getCompanyId, missingEnv, noCompany, unauthorized } from "../../../configure/_lib";
import { backendAuthorizationHeaders } from "@/lib/backend-auth";

const ALLOWED_ACTIONS = new Set(["takeover", "start-ai", "block", "unblock"]);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ chat_id: string; action: string }> },
) {
  const { chat_id, action } = await params;

  if (!ALLOWED_ACTIONS.has(action)) {
    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return unauthorized();

  const apiKey = process.env.TWINO_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiKey || !apiUrl) return missingEnv();

  const companyId = await getCompanyId(session.booking_id);
  if (!companyId) return noCompany();

  const upstream = await fetch(
    `${apiUrl}/chat/${companyId}/${encodeURIComponent(chat_id)}/${action}`,
    {
      method: "POST",
      headers: backendAuthorizationHeaders(String(companyId)),
    },
  ).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error(`[chat-controls POST ${action}] upstream error:`, upstream?.status, detail);
    return Response.json({ error: `Failed to ${action}` }, { status: upstream?.status ?? 503 });
  }

  return Response.json({ ok: true });
}
