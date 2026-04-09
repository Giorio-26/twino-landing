import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Dashboard routes: handle Supabase auth only (no i18n)
	if (pathname.startsWith("/dashboard")) {
		return updateSession(request);
	}

	// All other routes: handle i18n
	return intlMiddleware(request);
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};
