create extension if not exists pgcrypto;

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  birth_date date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_identities (
  person_id uuid primary key references public.people(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  primary_email text,
  email_verified_at timestamptz,
  must_change_password boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.distributions (
  id uuid primary key default gen_random_uuid(),
  country_code text not null default 'BR',
  state_code text not null,
  name text not null,
  responsible_person_id uuid references public.people(id),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  unique(country_code,state_code)
);

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  name text not null,
  region_label text not null,
  business_owner_person_id uuid references public.people(id),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  unique(distribution_id,name)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts(id) on delete cascade,
  leader_person_id uuid not null references public.people(id),
  name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  role text not null check (role in ('DISTRIBUTION','BUSINESS_OWNER','LEADER','CONSULTANT')),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  parent_person_id uuid references public.people(id),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  check ((role='DISTRIBUTION' and district_id is null and group_id is null)
      or (role='BUSINESS_OWNER' and district_id is not null and group_id is null)
      or (role in ('LEADER','CONSULTANT') and district_id is not null))
);

create unique index if not exists memberships_one_current_per_person
  on public.memberships(person_id) where is_current;
create index if not exists memberships_distribution_idx on public.memberships(distribution_id,role,is_current);
create index if not exists memberships_district_idx on public.memberships(district_id,role,is_current);
create index if not exists memberships_group_idx on public.memberships(group_id,role,is_current);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  goal_type text not null check (goal_type in ('sales','recruitment','activation','orders','leader_development','retention','custom')),
  label text not null,
  target_value numeric not null check (target_value >= 0),
  current_value numeric,
  owner_person_id uuid references public.people(id),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  visibility text not null default 'SCOPE' check (visibility in ('PRIVATE','SCOPE','PEER_AGGREGATE','DISTRIBUTION')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id),
  distribution_id uuid not null references public.distributions(id),
  district_id uuid not null references public.districts(id),
  group_id uuid references public.groups(id),
  source text not null default 'OTHER' check (source in ('AUDIO','PHOTO','TEXT','OTHER')),
  summary text not null,
  amount numeric check (amount is null or amount >= 0),
  stage text not null default 'RECEIVED',
  cycle_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_scope_idx on public.orders(distribution_id,district_id,group_id,created_at desc);

create table if not exists public.performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  period_key text not null,
  role text not null check (role in ('BUSINESS_OWNER','LEADER','CONSULTANT')),
  person_id uuid not null references public.people(id) on delete cascade,
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  goal_percent numeric,
  growth_percent numeric,
  recruitment_count integer not null default 0 check (recruitment_count >= 0),
  active_count integer not null default 0 check (active_count >= 0),
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(period_key,role,person_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  code text not null,
  label text not null,
  distribution_id uuid not null references public.distributions(id),
  district_id uuid references public.districts(id),
  group_id uuid references public.groups(id),
  achieved_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.network_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_person_id uuid references public.people(id),
  subject_person_id uuid references public.people(id),
  distribution_id uuid not null references public.distributions(id),
  district_id uuid references public.districts(id),
  group_id uuid references public.groups(id),
  visibility text not null default 'SCOPE' check (visibility in ('PRIVATE','GROUP','DISTRICT','DISTRIBUTION')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_person_id uuid references public.people(id),
  action text not null,
  subject_person_id uuid references public.people(id),
  distribution_id uuid references public.distributions(id),
  district_id uuid references public.districts(id),
  group_id uuid references public.groups(id),
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create or replace view public.business_owner_scoreboard
with (security_invoker = true)
as
select
  ps.period_key,
  ps.person_id,
  p.full_name,
  ps.distribution_id,
  ps.district_id,
  d.name as district_name,
  ps.goal_percent,
  ps.growth_percent,
  ps.recruitment_count,
  ps.active_count,
  ps.badges
from public.performance_snapshots ps
join public.people p on p.id=ps.person_id
join public.districts d on d.id=ps.district_id
where ps.role='BUSINESS_OWNER';

create or replace view public.leader_scoreboard
with (security_invoker = true)
as
select
  ps.period_key,
  ps.person_id,
  p.full_name,
  ps.distribution_id,
  ps.district_id,
  ps.group_id,
  ps.goal_percent,
  ps.growth_percent,
  ps.recruitment_count,
  ps.active_count,
  ps.badges
from public.performance_snapshots ps
join public.people p on p.id=ps.person_id
where ps.role='LEADER';
