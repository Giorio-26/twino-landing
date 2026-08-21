import "server-only";

import { redirect } from "next/navigation";
import { isTrustedAdminIdentity } from "@/lib/admin-authorization";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export interface AdminAuthorization {
  authenticated: boolean;
  authorized: boolean;
}

export async function getAdminAuthorization(): Promise<AdminAuthorization> {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return { authenticated: false, authorized: false };
  }

  return {
    authenticated: true,
    authorized: isTrustedAdminIdentity(
      user,
      process.env.ADMIN_SUPABASE_USER_IDS,
    ),
  };
}

export async function requireAdminPage(locale: string): Promise<void> {
  const authorization = await getAdminAuthorization();
  if (!authorization.authorized) {
    redirect(`/${locale}/admin?error=admin_required`);
  }
}

export async function requireAdminApi(): Promise<Response | null> {
  const authorization = await getAdminAuthorization();
  if (!authorization.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!authorization.authorized) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
