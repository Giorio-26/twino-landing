export interface AdminUserIdentity {
  id: string;
}

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
