import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "twino_access_session";
export const EVENT_SESSION_COOKIE = "twino_event_session";

const secret = () =>
  process.env.ACCESS_SESSION_SECRET ?? "dev-secret-change-me";

function hmacSign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function hmacVerify(token: string): string | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;

    const data = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    const expected = hmacSign(data);
    const sigBuf = Buffer.from(sig, "base64url");
    const expectedBuf = Buffer.from(expected, "base64url");

    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    return data;
  } catch {
    return null;
  }
}

export interface AccessSession {
  booking_id: number;
  expires_at: string; // ISO 8601
}

export function signSession(session: AccessSession): string {
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${data}.${hmacSign(data)}`;
}

export function verifySession(token: string): AccessSession | null {
  const data = hmacVerify(token);
  if (!data) return null;
  try {
    const session: AccessSession = JSON.parse(
      Buffer.from(data, "base64url").toString(),
    );
    if (new Date(session.expires_at) < new Date()) return null;
    return session;
  } catch {
    return null;
  }
}

export interface EventSession {
  role: "organizer" | "company";
  company_id?: number;
  expires_at: string; // ISO 8601
}

export function signEventSession(session: EventSession): string {
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${data}.${hmacSign(data)}`;
}

export function verifyEventSession(token: string): EventSession | null {
  const data = hmacVerify(token);
  if (!data) return null;
  try {
    const session: EventSession = JSON.parse(
      Buffer.from(data, "base64url").toString(),
    );
    if (new Date(session.expires_at) < new Date()) return null;
    return session;
  } catch {
    return null;
  }
}
