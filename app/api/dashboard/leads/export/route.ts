import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getCompanyId, missingEnv, noCompany, unauthorized } from "../../configure/_lib";

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

  const upstream = await fetch(`${apiUrl}/leads/${companyId}/export`, {
    headers: { "X-API-KEY": apiKey },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) {
    const detail = await upstream?.text().catch(() => "");
    console.error("[leads export GET] upstream error:", upstream?.status, detail);
    return Response.json({ error: "Failed to export leads" }, { status: upstream?.status ?? 503 });
  }

  const csv = await upstream.text();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads.csv"`,
    },
  });
}
