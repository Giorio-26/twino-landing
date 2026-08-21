import assert from "node:assert/strict";
import test from "node:test";
import {
  getAdminAuthorizationDecision,
  isTrustedAdminIdentity,
} from "../lib/admin-authorization";

const admin = {
  id: "admin-user-id",
};

test("fails closed when no allowlist is configured", () => {
  assert.equal(isTrustedAdminIdentity(admin, undefined), false);
});

test("classifies an unauthenticated request for a 401 response", () => {
  assert.equal(
    getAdminAuthorizationDecision(null, "admin-user-id"),
    "unauthenticated",
  );
});

test("accepts an exact trusted Supabase user ID", () => {
  assert.equal(
    isTrustedAdminIdentity(admin, "another-id, admin-user-id"),
    true,
  );
  assert.equal(
    getAdminAuthorizationDecision(admin, "admin-user-id"),
    "authorized",
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
  assert.equal(
    getAdminAuthorizationDecision({ id: "customer-user-id" }, "admin-user-id"),
    "forbidden",
  );
});
