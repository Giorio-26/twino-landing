import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // i18n middleware is authoritative for routing/locale headers.
  const intlResponse = intlMiddleware(request);

  // Refresh Supabase session cookies — wrapped so any auth failure never
  // crashes the middleware worker and causes a 502.
  try {
    const supabaseResponse = await updateSession(request);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    }
  } catch {
    // Session refresh failed (e.g. stale refresh token). The request
    // continues without updated auth cookies; getAuthenticatedUser()
    // in route handlers handles auth independently.
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
