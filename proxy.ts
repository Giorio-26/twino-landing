import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Refresh Supabase session cookies on every request so server components
  // can reliably call getUser() without stale tokens.
  const supabaseResponse = await updateSession(request);

  // i18n middleware is authoritative for routing/locale headers.
  const intlResponse = intlMiddleware(request);

  // Merge any new/updated Supabase auth cookies into the intl response so
  // both concerns are satisfied by the single response returned to the client.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
