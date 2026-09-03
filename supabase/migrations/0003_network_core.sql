-- VoeTupper multiuser network core. This migration coexists with the legacy workspace pilot during staged migration.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'network_role') then
    create type public.network_role as enum ('DISTRIBUTION','BUSINESS_OWNER','LEADER','CONSULTANT');
  end if;
end $$;

create table if not exists public.people(
  id uuid primary key default gen_random_uuid(),
  display_name text not null check(char_length(trim(display_name)) between 2 and 120),
  phone text,
  status text not null default 'ACTIVE' check(status in ('ACTIVE','INACTIVE','PENDING')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_identities(
  person_id uuid not null references public.people(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  login_status text not null default 'active' check(login_status in ('awaiting_email','invitation_pending','active','blocked')),
  must_change_password boolean not null default false,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  primary key(person_id),
  unique(user_id)
);

create table if not exists public.distributions(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state_code text,
  created_at timestamptz not null default now(),
  unique(name,state_code)
);

create table if not exists public.districts(
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(distribution_id,name)
);

create table if not exists public.groups(
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(district_id,name),
  check(district_id is not null)
);

create table if not exists public.memberships(
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  role public.network_role not null,
  distribution_id uuid not null references public.distributions(id) on delete restrict,
  district_id uuid references public.districts(id) on delete restrict,
  group_id uuid references public.groups(id) on delete restrict,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  approved_by_person_id uuid references public.people(id) on delete set null,
  created_at timestamptz not null default now(),
  check(ended_at is null or ended_at >= started_at),
  check(
    (role='DISTRIBUTION' and district_id is null and group_id is null)
    or (role='BUSINESS_OWNER' and district_id is not null and group_id is null)
    or (role='LEADER' and district_id is not null and group_id is not null)
    or (role='CONSULTANT' and district_id is not null)
  )
);

create unique index if not exists one_current_membership_per_person
  on public.memberships(person_id)
  where ended_at is null;
create index if not exists memberships_distribution_idx on public.memberships(distribution_id,role) where ended_at is null;
create index if not exists memberships_district_idx on public.memberships(district_id,role) where ended_at is null;
create index if not exists memberships_group_idx on public.memberships(group_id,role) where ended_at is null;

create table if not exists public.goals(
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade,
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  goal_type text not null check(goal_type in ('sales','recruitment','activation','growth')),
  cycle_key text not null,
  target_value numeric(14,2) not null default 0 check(target_value >= 0),
  current_value numeric(14,2) not null default 0 check(current_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(person_id,goal_type,cycle_key)
);

-- Existing orders are preserved and receive canonical network scope columns for staged migration.
alter table public.orders add column if not exists person_id uuid references public.people(id) on delete restrict;
alter table public.orders add column if not exists distribution_id uuid references public.distributions(id) on delete restrict;
alter table public.orders add column if not exists district_id uuid references public.districts(id) on delete restrict;
alter table public.orders add column if not exists group_id uuid references public.groups(id) on delete restrict;
create index if not exists orders_network_scope_idx on public.orders(distribution_id,district_id,group_id,person_id);

create table if not exists public.performance_snapshots(
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  cycle_key text not null,
  sales_amount numeric(14,2) not null default 0 check(sales_amount >= 0),
  goal_percent numeric(8,2) not null default 0,
  growth_percent numeric(8,2) not null default 0,
  recruitment_count integer not null default 0 check(recruitment_count >= 0),
  activation_percent numeric(8,2) not null default 0,
  captured_at timestamptz not null default now()
);
create index if not exists performance_scope_idx on public.performance_snapshots(distribution_id,district_id,group_id,captured_at desc);

create table if not exists public.achievements(
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  achievement_type text not null,
  label text not null,
  cycle_key text,
  achieved_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.network_events(
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete set null,
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text,
  visibility text not null default 'scope' check(visibility in ('private','scope','peer_aggregate')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log(
  id bigint generated always as identity primary key,
  actor_person_id uuid references public.people(id) on delete set null,
  distribution_id uuid not null references public.distributions(id) on delete restrict,
  district_id uuid references public.districts(id) on delete restrict,
  group_id uuid references public.groups(id) on delete restrict,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_scope_created_idx on public.audit_log(distribution_id,district_id,created_at desc);
