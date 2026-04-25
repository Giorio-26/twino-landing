CREATE TABLE IF NOT EXISTS event_key_audit_logs (
  id             bigserial    PRIMARY KEY,
  event_key_id   bigint,                             -- soft ref to event_access_keys(id), no FK until that table is migrated
  key            text         NOT NULL,              -- denormalized key string, stays readable after key deletion
  entity         text         NOT NULL,              -- company name or "Property Georgia" for organizer keys
  role           text         NOT NULL CHECK (role IN ('organizer', 'company')),
  company_id     bigint,
  ip_address     text,
  terms_accepted boolean      NOT NULL DEFAULT false,
  first_used_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX ON event_key_audit_logs (key);
CREATE INDEX ON event_key_audit_logs (event_key_id);

ALTER TABLE event_key_audit_logs ENABLE ROW LEVEL SECURITY;
