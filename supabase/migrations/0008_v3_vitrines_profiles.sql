-- VoeTupper V3: Vitrine is the operational period and goals belong to people.

create table if not exists public.vitrines(
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  label text not null,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(distribution_id,label),
  check(closes_at > opens_at)
);

create table if not exists public.vitrine_goals(
  id uuid primary key default gen_random_uuid(),
  vitrine_id uuid not null references public.vitrines(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  goal_type text not null check(goal_type in ('sales','recruitment','activity')),
  target_value numeric(14,2) not null check(target_value >= 0),
  current_value numeric(14,2) not null default 0 check(current_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(vitrine_id,person_id,goal_type)
);

alter table public.vitrines enable row level security;
alter table public.vitrine_goals enable row level security;

create policy vitrines_scoped_read on public.vitrines for select
to authenticated
using(exists(
  select 1 from public.memberships viewer
  where viewer.person_id=public.current_person_id()
    and viewer.ended_at is null
    and viewer.distribution_id=vitrines.distribution_id
));

create policy vitrines_admin_write on public.vitrines for all
to authenticated
using(public.can_admin_scope(distribution_id,null))
with check(public.can_admin_scope(distribution_id,null));

create policy vitrine_goals_scoped_read on public.vitrine_goals for select
to authenticated
using(exists(
  select 1
  from public.memberships target
  join public.vitrines v on v.id=vitrine_goals.vitrine_id
  where target.person_id=vitrine_goals.person_id
    and target.ended_at is null
    and target.distribution_id=v.distribution_id
    and public.can_read_operational_scope(target.person_id,target.distribution_id,target.district_id,target.group_id)
));

create policy vitrine_goals_admin_write on public.vitrine_goals for all
to authenticated
using(exists(
  select 1 from public.memberships target
  where target.person_id=vitrine_goals.person_id
    and target.ended_at is null
    and public.can_admin_scope(target.distribution_id,target.district_id)
))
with check(exists(
  select 1 from public.memberships target
  where target.person_id=vitrine_goals.person_id
    and target.ended_at is null
    and public.can_admin_scope(target.distribution_id,target.district_id)
));

-- Scoreboards must execute with the caller's RLS context on Postgres 15+.
alter view public.business_owner_scoreboard set (security_invoker = true);
alter view public.leader_scoreboard set (security_invoker = true);

-- Existing helper functions are intentionally callable only by authenticated sessions.
revoke all on function public.current_person_id() from public, anon;
revoke all on function public.current_membership() from public, anon;
revoke all on function public.same_distribution(uuid,uuid) from public, anon;
revoke all on function public.same_district(uuid,uuid) from public, anon;
revoke all on function public.can_view_person(uuid) from public, anon;
revoke all on function public.can_manage_scope(uuid,uuid,uuid) from public, anon;
revoke all on function public.can_read_operational_scope(uuid,uuid,uuid,uuid) from public, anon;
revoke all on function public.can_admin_scope(uuid,uuid) from public, anon;

grant execute on function public.current_person_id() to authenticated;
grant execute on function public.current_membership() to authenticated;
grant execute on function public.same_distribution(uuid,uuid) to authenticated;
grant execute on function public.same_district(uuid,uuid) to authenticated;
grant execute on function public.can_view_person(uuid) to authenticated;
grant execute on function public.can_manage_scope(uuid,uuid,uuid) to authenticated;
grant execute on function public.can_read_operational_scope(uuid,uuid,uuid,uuid) to authenticated;
grant execute on function public.can_admin_scope(uuid,uuid) to authenticated;
