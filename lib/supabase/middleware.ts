import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Track every cookie name the Supabase library writes during this request.
  // We use this later to detect and clear stale chunk cookies (e.g. a previous
  // token was split into .0 .1 .2, the refreshed token only needs .0 .1 — the
  // stale .2 must be cleared or the next reassembly produces corrupted JSON).
  const writtenCookieNames = new Set<string>();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          writtenCookieNames.add(name);
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          writtenCookieNames.add(name);
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  try {
    const { error } = await supabase.auth.getUser();
    if (error) {
      clearAllSupabaseCookies(request, response);
      return response;
    }
  } catch {
    // Malformed/unparseable cookie — clear everything so downstream code
    // never sees a broken auth state.
    clearAllSupabaseCookies(request, response);
    return response;
  }

  // Clear stale chunk cookies that were NOT rewritten in this request.
  //
  // Pattern: sb-<project>-auth-token.<N>  (chunks beyond what the new token needs)
  // The library never removes them itself when the refreshed token is smaller.
  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith("sb-")) continue;
    if (writtenCookieNames.has(cookie.name)) continue;

    // Check if this cookie belongs to a cookie family that WAS rewritten.
    // e.g. cookie.name = "sb-proj-auth-token.2" and "sb-proj-auth-token.0"
    // was written → this chunk is stale.
    const dotIndex = cookie.name.lastIndexOf(".");
    if (dotIndex === -1) continue;

    const possibleChunkSuffix = cookie.name.slice(dotIndex + 1);
    if (!/^\d+$/.test(possibleChunkSuffix)) continue; // not a numeric chunk

    const baseName = cookie.name.slice(0, dotIndex);
    const familyWasRewritten = [...writtenCookieNames].some(
      (w) => w === baseName || w.startsWith(`${baseName}.`),
    );

    if (familyWasRewritten) {
      response.cookies.set(cookie.name, "", { maxAge: 0 });
    }
  }

  return response;
}

function clearAllSupabaseCookies(request: NextRequest, response: NextResponse) {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", { maxAge: 0 });
    }
  }
}
