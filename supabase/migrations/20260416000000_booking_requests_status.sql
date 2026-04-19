-- ============================================================
-- Booking Requests Table
-- ============================================================
-- Creates the table if it doesn't exist, or migrates the
-- existing `reached: boolean` column to `status: text`.
-- ============================================================

create table if not exists public.booking_requests (
  id               bigserial    primary key,
  created_at       timestamptz  not null default now(),
  first_name       text         not null,
  last_name        text         not null,
  email            text         not null,
  company_name     text,
  social_media_url text,
  status           text         not null default 'new'
                   check (status in ('new', 'reached', 'deal'))
);

-- Migrate existing table if it was created with a `reached` boolean
do $$
begin
  -- Only run migration if `status` column does not yet exist
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'booking_requests'
      and column_name  = 'status'
  ) then
    -- Add status column (no constraint yet, so existing rows accept the default)
    alter table public.booking_requests
      add column status text not null default 'new';

    -- Migrate data from boolean reached column if present
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name   = 'booking_requests'
        and column_name  = 'reached'
    ) then
      update public.booking_requests set status = 'reached' where reached = true;
      alter table public.booking_requests drop column reached;
    end if;

    -- Add check constraint after data migration
    alter table public.booking_requests
      add constraint booking_requests_status_check
      check (status in ('new', 'reached', 'deal'));
  end if;
end;
$$;

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table public.booking_requests enable row level security;

-- Public can insert (the booking form is unauthenticated)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'booking_requests'
      and policyname = 'booking_requests: public insert'
  ) then
    create policy "booking_requests: public insert"
      on public.booking_requests for insert
      with check (true);
  end if;
end;
$$;

-- Admins (service role) bypass RLS entirely — no additional policy needed.
