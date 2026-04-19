import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "twino_access_session";

const secret = () =>
  process.env.ACCESS_SESSION_SECRET ?? "dev-secret-change-me";

export interface AccessSession {
  booking_id: number;
  expires_at: string; // ISO 8601
}

export function signSession(session: AccessSession): string {
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySession(token: string): AccessSession | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;

    const data = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    const expected = createHmac("sha256", secret())
      .update(data)
      .digest("base64url");

    const sigBuf = Buffer.from(sig, "base64url");
    const expectedBuf = Buffer.from(expected, "base64url");

    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    const session: AccessSession = JSON.parse(
      Buffer.from(data, "base64url").toString(),
    );

    if (new Date(session.expires_at) < new Date()) return null;

    return session;
  } catch {
    return null;
  }
}
