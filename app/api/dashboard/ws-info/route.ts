import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getCompanyId, missingEnv, noCompany, unauthorized } from "../configure/_lib";
import { createBackendAccessToken } from "@/lib/backend-auth";

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

  // Derive WS URL from API base: https://api.twino.estate/... → wss://api.twino.estate
  // Derive WS URL: https://api.twino.estate/langchain/api → wss://api.twino.estate/langchain/ws/chat/{id}
  const { host, pathname } = new URL(apiUrl);
  const wsBase = pathname.replace(/\/api$/, "");
  const wsUrl = `wss://${host}${wsBase}/ws/chat/${companyId}`;
  const wsToken = createBackendAccessToken(String(companyId));

  return Response.json({ wsUrl, wsToken, companyId });
}
