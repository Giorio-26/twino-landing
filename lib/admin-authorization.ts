export interface AdminUserIdentity {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
}

function parseAllowlist(
  value: string | undefined,
  normalize = false,
): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (normalize ? item.toLowerCase() : item)),
  );
}

export function isTrustedAdminIdentity(
  user: AdminUserIdentity,
  allowedUserIds: string | undefined,
  allowedEmails: string | undefined,
): boolean {
  const userIds = parseAllowlist(allowedUserIds);
  if (userIds.has(user.id)) return true;

  const email = user.email?.trim().toLowerCase();
  if (!email || !user.email_confirmed_at) return false;

  return parseAllowlist(allowedEmails, true).has(email);
}
