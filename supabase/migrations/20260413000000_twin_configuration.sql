-- ============================================================
-- Twin Configuration Schema
-- ============================================================
-- One row per user: stores identity, tone, and knowledge base.
-- ============================================================

create table if not exists public.twin_configurations (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  twin_name            text        not null default 'Ana',
  welcome_message      text        not null default 'Hello! I''m {name}, your real estate assistant. How can I help you today?',
  tone                 text        not null default 'friendly'
                                   check (tone in ('corporate','friendly','direct','luxury','consultative')),
  agency_name          text        not null default '',
  agency_address       text        not null default '',
  agency_working_hours text        not null default 'Mon-Fri 9:00-18:00, Sat 10:00-15:00',
  agency_phone         text        not null default '',
  agency_website       text        not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint twin_configurations_user_id_key unique (user_id)
);

-- ============================================================
-- Guardian Rules
-- ============================================================
-- Many per user. Ordered by sort_order asc then created_at asc.
-- ============================================================

create table if not exists public.guardian_rules (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  rule_text  text        not null,
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists guardian_rules_user_id_idx on public.guardian_rules(user_id);

-- ============================================================
-- Properties
-- ============================================================
-- Many per user; max 15 enforced at the API layer.
-- ============================================================

create table if not exists public.properties (
  id         uuid           primary key default gen_random_uuid(),
  user_id    uuid           not null references auth.users(id) on delete cascade,
  name       text           not null,
  price      numeric(12, 2) not null,
  location   text           not null,
  rooms      int            not null default 1,
  area       numeric(10, 2),
  status     text           not null default 'available'
                            check (status in ('available', 'reserved', 'sold')),
  link       text           not null default '',
  created_at timestamptz    not null default now()
);

create index if not exists properties_user_id_idx on public.properties(user_id);

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table public.twin_configurations enable row level security;
alter table public.guardian_rules      enable row level security;
alter table public.properties          enable row level security;

-- Users can only read/write their own rows
create policy "twin_configurations: owner full access"
  on public.twin_configurations for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "guardian_rules: owner full access"
  on public.guardian_rules for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "properties: owner full access"
  on public.properties for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Auto-update updated_at on twin_configurations
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger twin_configurations_updated_at
  before update on public.twin_configurations
  for each row execute function public.handle_updated_at();
