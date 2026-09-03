-- VoeTupper hierarchical RLS. Runtime authorization belongs in Postgres, not only in the UI.

create or replace function public.current_person_id()
returns uuid
language sql
stable
security definer
set search_path=''
as $$
  select ai.person_id
  from public.auth_identities ai
  where ai.user_id = auth.uid()
    and ai.login_status = 'active'
  limit 1
$$;

create or replace function public.current_membership()
returns public.memberships
language sql
stable
security definer
set search_path=''
as $$
  select m
  from public.memberships m
  where m.person_id = public.current_person_id()
    and m.ended_at is null
  limit 1
$$;

create or replace function public.same_distribution(person_a uuid, person_b uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists(
    select 1
    from public.memberships a
    join public.memberships b on b.person_id = person_b and b.ended_at is null
    where a.person_id = person_a
      and a.ended_at is null
      and a.distribution_id = b.distribution_id
  )
$$;

create or replace function public.same_district(person_a uuid, person_b uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists(
    select 1
    from public.memberships a
    join public.memberships b on b.person_id = person_b and b.ended_at is null
    where a.person_id = person_a
      and a.ended_at is null
      and a.district_id is not null
      and a.district_id = b.district_id
      and a.distribution_id = b.distribution_id
  )
$$;

create or replace function public.can_view_person(target_person_id uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select target_person_id = public.current_person_id()
  or exists(
    select 1
    from public.memberships viewer
    join public.memberships target on target.person_id = target_person_id and target.ended_at is null
    where viewer.person_id = public.current_person_id()
      and viewer.ended_at is null
      and viewer.distribution_id = target.distribution_id
      and (
        viewer.role = 'DISTRIBUTION'
        or (viewer.role = 'BUSINESS_OWNER' and viewer.district_id = target.district_id)
        or (viewer.role = 'LEADER' and viewer.group_id is not null and viewer.group_id = target.group_id and target.role = 'CONSULTANT')
      )
  )
$$;

create or replace function public.can_manage_scope(target_distribution_id uuid, target_district_id uuid, target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists(
    select 1
    from public.memberships viewer
    where viewer.person_id = public.current_person_id()
      and viewer.ended_at is null
      and viewer.distribution_id = target_distribution_id
      and (
        viewer.role = 'DISTRIBUTION'
        or (viewer.role = 'BUSINESS_OWNER' and viewer.district_id is not distinct from target_district_id)
        or (viewer.role = 'LEADER' and viewer.group_id is not null and viewer.group_id is not distinct from target_group_id)
      )
  )
$$;

create or replace function public.can_read_operational_scope(target_person_id uuid, target_distribution_id uuid, target_district_id uuid, target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select target_person_id = public.current_person_id()
  or exists(
    select 1
    from public.memberships viewer
    where viewer.person_id = public.current_person_id()
      and viewer.ended_at is null
      and viewer.distribution_id = target_distribution_id
      and (
        (viewer.role = 'DISTRIBUTION')
        or (viewer.role = 'BUSINESS_OWNER' and viewer.district_id is not distinct from target_district_id)
        or (viewer.role = 'LEADER' and viewer.group_id is not null and viewer.group_id is not distinct from target_group_id)
      )
  )
$$;

alter table public.people enable row level security;
alter table public.auth_identities enable row level security;
alter table public.distributions enable row level security;
alter table public.districts enable row level security;
alter table public.groups enable row level security;
alter table public.memberships enable row level security;
alter table public.goals enable row level security;
alter table public.orders enable row level security;
alter table public.performance_snapshots enable row level security;
alter table public.achievements enable row level security;
alter table public.network_events enable row level security;
alter table public.audit_log enable row level security;

create policy people_network_read on public.people for select
using(public.can_view_person(id));
create policy people_self_update on public.people for update
using(id = public.current_person_id())
with check(id = public.current_person_id());

create policy auth_identity_self_read on public.auth_identities for select
using(person_id = public.current_person_id());

create policy distributions_network_read on public.distributions for select
using(exists(
  select 1 from public.memberships viewer
  where viewer.person_id = public.current_person_id()
    and viewer.ended_at is null
    and viewer.distribution_id = distributions.id
));

create policy districts_distribution_read on public.districts for select
using(exists(
  select 1 from public.memberships viewer
  where viewer.person_id = public.current_person_id()
    and viewer.ended_at is null
    and viewer.distribution_id = districts.distribution_id
));

create policy groups_scoped_read on public.groups for select
using(exists(
  select 1 from public.memberships viewer
  where viewer.person_id = public.current_person_id()
    and viewer.ended_at is null
    and viewer.distribution_id = groups.distribution_id
    and (
      viewer.role = 'DISTRIBUTION'
      or (viewer.role = 'BUSINESS_OWNER' and viewer.district_id = groups.district_id)
      or (viewer.role in ('LEADER','CONSULTANT') and viewer.group_id = groups.id)
    )
));

create policy memberships_scoped_read on public.memberships for select
using(public.can_view_person(person_id));
create policy memberships_scoped_write on public.memberships for all
using(public.can_manage_scope(distribution_id,district_id,group_id))
with check(public.can_manage_scope(distribution_id,district_id,group_id));

create policy goals_scoped_read on public.goals for select
using(
  public.can_read_operational_scope(person_id,distribution_id,district_id,group_id)
  or public.can_manage_scope(distribution_id,district_id,group_id)
);
create policy goals_scoped_write on public.goals for all
using(public.can_manage_scope(distribution_id,district_id,group_id) or person_id = public.current_person_id())
with check(public.can_manage_scope(distribution_id,district_id,group_id) or person_id = public.current_person_id());

-- The flat MVP policy granted every workspace member all order rows. The hierarchical phase replaces it.
drop policy if exists orders_member on public.orders;
create policy orders_network_read on public.orders for select
using(
  person_id is not null
  and distribution_id is not null
  and public.can_read_operational_scope(person_id,distribution_id,district_id,group_id)
);
create policy orders_network_insert on public.orders for insert
with check(
  person_id is not null
  and distribution_id is not null
  and public.can_read_operational_scope(person_id,distribution_id,district_id,group_id)
);
create policy orders_network_update on public.orders for update
using(
  person_id is not null
  and distribution_id is not null
  and public.can_read_operational_scope(person_id,distribution_id,district_id,group_id)
)
with check(
  person_id is not null
  and distribution_id is not null
  and public.can_read_operational_scope(person_id,distribution_id,district_id,group_id)
);

create policy performance_scoped_read on public.performance_snapshots for select
using(public.can_read_operational_scope(person_id,distribution_id,district_id,group_id));
create policy performance_scoped_write on public.performance_snapshots for all
using(public.can_manage_scope(distribution_id,district_id,group_id))
with check(public.can_manage_scope(distribution_id,district_id,group_id));

create policy achievements_scoped_read on public.achievements for select
using(public.can_read_operational_scope(person_id,distribution_id,district_id,group_id));
create policy achievements_scoped_write on public.achievements for all
using(public.can_manage_scope(distribution_id,district_id,group_id))
with check(public.can_manage_scope(distribution_id,district_id,group_id));

create policy network_events_scoped_read on public.network_events for select
using(
  public.can_read_operational_scope(person_id,distribution_id,district_id,group_id)
  or public.can_manage_scope(distribution_id,district_id,group_id)
);
create policy network_events_scoped_write on public.network_events for all
using(public.can_manage_scope(distribution_id,district_id,group_id))
with check(public.can_manage_scope(distribution_id,district_id,group_id));

create policy audit_scoped_read on public.audit_log for select
using(public.can_manage_scope(distribution_id,district_id,group_id));

create or replace view public.business_owner_scoreboard
with (security_barrier=true)
as
select
  owner.person_id,
  owner.distribution_id,
  owner.district_id,
  d.name as district_name,
  p.display_name,
  latest.goal_percent,
  latest.growth_percent,
  latest.recruitment_count,
  latest.activation_percent,
  latest.cycle_key,
  latest.captured_at
from public.memberships owner
join public.people p on p.id = owner.person_id
join public.districts d on d.id = owner.district_id
left join lateral (
  select ps.goal_percent,ps.growth_percent,ps.recruitment_count,ps.activation_percent,ps.cycle_key,ps.captured_at
  from public.performance_snapshots ps
  where ps.person_id = owner.person_id
  order by ps.captured_at desc
  limit 1
) latest on true
where owner.role = 'BUSINESS_OWNER'
  and owner.ended_at is null
  and exists(
    select 1 from public.memberships viewer
    where viewer.person_id = public.current_person_id()
      and viewer.ended_at is null
      and viewer.distribution_id = owner.distribution_id
      and viewer.role in ('DISTRIBUTION','BUSINESS_OWNER')
  );

create or replace view public.leader_scoreboard
with (security_barrier=true)
as
select
  leader.person_id,
  leader.distribution_id,
  leader.district_id,
  leader.group_id,
  p.display_name,
  latest.goal_percent,
  latest.growth_percent,
  latest.recruitment_count,
  latest.activation_percent,
  latest.cycle_key,
  latest.captured_at
from public.memberships leader
join public.people p on p.id = leader.person_id
left join lateral (
  select ps.goal_percent,ps.growth_percent,ps.recruitment_count,ps.activation_percent,ps.cycle_key,ps.captured_at
  from public.performance_snapshots ps
  where ps.person_id = leader.person_id
  order by ps.captured_at desc
  limit 1
) latest on true
where leader.role = 'LEADER'
  and leader.ended_at is null
  and exists(
    select 1 from public.memberships viewer
    where viewer.person_id = public.current_person_id()
      and viewer.ended_at is null
      and viewer.distribution_id = leader.distribution_id
      and (
        viewer.role = 'DISTRIBUTION'
        or (viewer.role = 'BUSINESS_OWNER' and viewer.district_id = leader.district_id)
        or (viewer.role = 'LEADER' and viewer.district_id = leader.district_id)
      )
  );
