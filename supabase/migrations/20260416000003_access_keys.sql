-- ============================================================
-- Access Keys Table
-- ============================================================
-- Stores time-limited access keys generated for "deal" bookings.
-- One key per booking (upsert strategy).
-- ============================================================

create table if not exists public.access_keys (
  id          bigserial    primary key,
  booking_id  bigint       not null references public.booking_requests(id) on delete cascade,
  key         text         not null,
  expires_at  timestamptz  not null,
  created_at  timestamptz  not null default now(),
  constraint access_keys_booking_id_unique unique (booking_id)
);

-- Service role bypasses RLS — no additional select/insert policies needed
-- for admin operations. Disable RLS so anon/authenticated reads are blocked
-- by default (no policy = no access).
alter table public.access_keys enable row level security;

create index if not exists access_keys_expires_at_idx
  on public.access_keys (expires_at);
