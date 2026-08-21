import "server-only";

import { createHmac } from "node:crypto";

const TOKEN_AUDIENCE = "twino-backend";
const TOKEN_TTL_SECONDS = 60;

export function createBackendAccessToken(companyId: string): string {
  const secret = process.env.TWINO_API_KEY;
  if (!secret) throw new Error("TWINO_API_KEY is not configured");

  const normalizedCompanyId = companyId.trim().toLowerCase();
  if (!normalizedCompanyId) throw new Error("companyId is required");

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      company_id: normalizedCompanyId,
      iat: issuedAt,
      exp: issuedAt + TOKEN_TTL_SECONDS,
      aud: TOKEN_AUDIENCE,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function backendAuthorizationHeaders(companyId: string) {
  return { Authorization: `Bearer ${createBackendAccessToken(companyId)}` };
}

