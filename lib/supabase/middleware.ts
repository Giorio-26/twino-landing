import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  try {
    const { error } = await supabase.auth.getUser();
    if (error) {
      // Token is invalid/expired and refresh failed — clear all Supabase
      // auth cookies so the broken state doesn't persist across requests.
      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.startsWith("sb-")) {
          response.cookies.set(cookie.name, "", { maxAge: 0 });
        }
      }
    }
  } catch {
    // Malformed cookie (e.g. invalid base64url) or unexpected error —
    // clear everything so downstream code never sees the broken state.
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.set(cookie.name, "", { maxAge: 0 });
      }
    }
  }

  return response;
}
