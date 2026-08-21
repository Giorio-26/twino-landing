import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedAdminIdentity } from "../lib/admin-authorization";

const admin = {
  id: "admin-user-id",
};

test("fails closed when no allowlist is configured", () => {
  assert.equal(isTrustedAdminIdentity(admin, undefined), false);
});

test("accepts an exact trusted Supabase user ID", () => {
  assert.equal(
    isTrustedAdminIdentity(admin, "another-id, admin-user-id"),
    true,
  );
});

test("rejects a normal customer identity", () => {
  assert.equal(
    isTrustedAdminIdentity(
      {
        id: "customer-user-id",
      },
      "admin-user-id",
    ),
    false,
  );
});
