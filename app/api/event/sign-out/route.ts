import { EVENT_SESSION_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(EVENT_SESSION_COOKIE);
  return Response.json({ ok: true });
}
