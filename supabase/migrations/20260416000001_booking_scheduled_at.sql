-- ============================================================
-- Add scheduled_at to booking_requests
-- ============================================================
-- Adds a nullable scheduled_at column so existing rows keep
-- their data. New bookings from the form will always supply
-- this value (enforced at the API layer).
-- ============================================================

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'booking_requests'
      and column_name  = 'scheduled_at'
  ) then
    alter table public.booking_requests
      add column scheduled_at timestamptz;
  end if;
end;
$$;

-- Index for fast availability look-ups (date-range queries)
create index if not exists booking_requests_scheduled_at_idx
  on public.booking_requests (scheduled_at)
  where scheduled_at is not null;
