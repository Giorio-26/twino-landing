export interface AdminUserIdentity {
  id: string;
}

export type AdminAuthorizationDecision =
  | "unauthenticated"
  | "forbidden"
  | "authorized";

function parseAllowlist(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function isTrustedAdminIdentity(
  user: AdminUserIdentity,
  allowedUserIds: string | undefined,
): boolean {
  return parseAllowlist(allowedUserIds).has(user.id);
}

export function getAdminAuthorizationDecision(
  user: AdminUserIdentity | null,
  allowedUserIds: string | undefined,
): AdminAuthorizationDecision {
  if (!user) return "unauthenticated";
  return isTrustedAdminIdentity(user, allowedUserIds)
    ? "authorized"
    : "forbidden";
}
