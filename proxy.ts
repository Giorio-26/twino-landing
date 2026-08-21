import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

function isDisabledLiveEventPath(pathname: string): boolean {
  return (
    pathname === "/api/event" ||
    pathname.startsWith("/api/event/") ||
    pathname === "/api/admin/event-companies" ||
    pathname.startsWith("/api/admin/event-companies/") ||
    pathname === "/api/admin/generate-event-key" ||
    pathname.startsWith("/api/admin/generate-event-key/") ||
    /^\/(?:[a-z]{2}\/)?event(?:\/|$)/.test(pathname) ||
    /^\/(?:[a-z]{2}\/)?admin\/event-keys(?:\/|$)/.test(pathname)
  );
}

// Only pay the getUser() network cost when Supabase cookies are present.
// For unauthenticated visitors there is nothing to refresh.
function hasSupabaseCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
}

// Clear all sb-* cookies on the response so a bad state never persists
// across subsequent requests.
function clearSupabaseCookies(
  response: NextResponse,
  request: NextRequest,
): void {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", { maxAge: 0 });
    }
  }
}

// If getUser() hangs (Supabase down / very slow), we don't want the whole
// middleware to block forever — that would make Nginx return 502.
const SESSION_TIMEOUT_MS = 8_000;

export default async function middleware(request: NextRequest) {
  if (isDisabledLiveEventPath(request.nextUrl.pathname)) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // i18n middleware is authoritative for routing / locale headers.
  const intlResponse = intlMiddleware(request);

  if (!hasSupabaseCookies(request)) {
    return intlResponse;
  }

  try {
    const supabaseResponse = await Promise.race([
      updateSession(request),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("supabase-session-timeout")),
          SESSION_TIMEOUT_MS,
        ),
      ),
    ]);

    // Copy any Set-Cookie headers produced by updateSession (refreshed tokens
    // or cleared stale cookies) onto the intl response so the browser sees them.
    for (const cookie of supabaseResponse.cookies.getAll()) {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    }
  } catch {
    // updateSession threw (malformed cookie, network error, timeout) →
    // clear all Supabase cookies so the broken state doesn't persist.
    clearSupabaseCookies(intlResponse, request);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/event/:path*",
    "/api/admin/event-companies/:path*",
    "/api/admin/generate-event-key/:path*",
  ],
};

