import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedAdminIdentity } from "../lib/admin-authorization";

const admin = {
  id: "admin-user-id",
  email: "Admin@TwinO.example",
  email_confirmed_at: "2026-08-22T00:00:00.000Z",
};

test("fails closed when no allowlist is configured", () => {
  assert.equal(isTrustedAdminIdentity(admin, undefined, undefined), false);
});

test("accepts an exact trusted Supabase user ID", () => {
  assert.equal(
    isTrustedAdminIdentity(admin, "another-id, admin-user-id", undefined),
    true,
  );
});

test("accepts a confirmed allowlisted email case-insensitively", () => {
  assert.equal(
    isTrustedAdminIdentity(admin, undefined, "admin@twino.example"),
    true,
  );
});

test("rejects an unconfirmed allowlisted email", () => {
  assert.equal(
    isTrustedAdminIdentity(
      { ...admin, email_confirmed_at: null },
      undefined,
      "admin@twino.example",
    ),
    false,
  );
});

test("rejects a normal customer identity", () => {
  assert.equal(
    isTrustedAdminIdentity(
      {
        id: "customer-user-id",
        email: "company-42@system.twino.app",
        email_confirmed_at: "2026-08-22T00:00:00.000Z",
      },
      "admin-user-id",
      "admin@twino.example",
    ),
    false,
  );
});
