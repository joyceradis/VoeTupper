create or replace function public.current_person_id()
returns uuid
language sql
stable
security definer
set search_path=public,auth
as $$
  select ai.person_id
  from public.auth_identities ai
  where ai.auth_user_id=auth.uid()
  limit 1
$$;

create or replace function public.current_membership()
returns public.memberships
language sql
stable
security definer
set search_path=public,auth
as $$
  select m
  from public.memberships m
  where m.person_id=public.current_person_id() and m.is_current
  limit 1
$$;

create or replace function public.same_distribution(target_distribution uuid)
returns boolean
language sql
stable
security definer
set search_path=public,auth
as $$
  select coalesce((public.current_membership()).distribution_id=target_distribution,false)
$$;

create or replace function public.same_district(target_district uuid)
returns boolean
language sql
stable
security definer
set search_path=public,auth
as $$
  select coalesce((public.current_membership()).district_id=target_district,false)
$$;

create or replace function public.same_group(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path=public,auth
as $$
  select coalesce((public.current_membership()).group_id=target_group,false)
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path=public,auth
as $$ select (public.current_membership()).role $$;

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

create policy people_select_scoped on public.people
for select to authenticated
using (
  id=public.current_person_id()
  or exists (
    select 1 from public.memberships target
    where target.person_id=people.id and target.is_current and (
      (public.current_role()='DISTRIBUTION' and target.role='BUSINESS_OWNER' and target.distribution_id=(public.current_membership()).distribution_id)
      or (public.current_role()='BUSINESS_OWNER' and target.district_id=(public.current_membership()).district_id)
      or (public.current_role()='LEADER' and target.role='CONSULTANT' and target.group_id=(public.current_membership()).group_id)
      or (public.current_role()='CONSULTANT' and target.role='LEADER' and target.group_id=(public.current_membership()).group_id)
    )
  )
);

create policy people_update_self_or_managed on public.people
for update to authenticated
using (
  id=public.current_person_id()
  or exists (
    select 1 from public.memberships target
    where target.person_id=people.id and target.is_current and (
      (public.current_role()='BUSINESS_OWNER' and target.district_id=(public.current_membership()).district_id)
      or (public.current_role()='LEADER' and target.role='CONSULTANT' and target.group_id=(public.current_membership()).group_id)
    )
  )
)
with check (
  id=public.current_person_id()
  or exists (
    select 1 from public.memberships target
    where target.person_id=people.id and target.is_current and (
      (public.current_role()='BUSINESS_OWNER' and target.district_id=(public.current_membership()).district_id)
      or (public.current_role()='LEADER' and target.role='CONSULTANT' and target.group_id=(public.current_membership()).group_id)
    )
  )
);

create policy auth_identity_self_select on public.auth_identities
for select to authenticated
using (person_id=public.current_person_id());

create policy auth_identity_self_update on public.auth_identities
for update to authenticated
using (person_id=public.current_person_id())
with check (person_id=public.current_person_id());

create policy distributions_select_own on public.distributions
for select to authenticated
using (id=(public.current_membership()).distribution_id);

create policy districts_select_scoped on public.districts
for select to authenticated
using (
  distribution_id=(public.current_membership()).distribution_id
  and (
    public.current_role()='DISTRIBUTION'
    or id=(public.current_membership()).district_id
    or public.current_role()='BUSINESS_OWNER'
  )
);

create policy groups_select_scoped on public.groups
for select to authenticated
using (
  (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role() in ('LEADER','CONSULTANT') and id=(public.current_membership()).group_id)
);

create policy memberships_select_scoped on public.memberships
for select to authenticated
using (
  person_id=public.current_person_id()
  or (public.current_role()='DISTRIBUTION' and role='BUSINESS_OWNER' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
);

create policy memberships_insert_managed on public.memberships
for insert to authenticated
with check (
  (public.current_role()='DISTRIBUTION' and role='BUSINESS_OWNER' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id and role in ('LEADER','CONSULTANT'))
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id and role='CONSULTANT')
);

create policy memberships_update_managed on public.memberships
for update to authenticated
using (
  (public.current_role()='DISTRIBUTION' and role='BUSINESS_OWNER' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id and role in ('LEADER','CONSULTANT'))
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id and role='CONSULTANT')
)
with check (
  (public.current_role()='DISTRIBUTION' and role='BUSINESS_OWNER' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id and role in ('LEADER','CONSULTANT'))
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id and role='CONSULTANT')
);

create policy goals_select_scoped on public.goals
for select to authenticated
using (
  owner_person_id=public.current_person_id()
  or (public.current_role()='DISTRIBUTION' and distribution_id=(public.current_membership()).distribution_id and district_id is null)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
);

create policy goals_write_managed on public.goals
for all to authenticated
using (
  (public.current_role()='DISTRIBUTION' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
)
with check (
  (public.current_role()='DISTRIBUTION' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
);

create policy orders_select_scoped on public.orders
for select to authenticated
using (
  person_id=public.current_person_id()
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
);

create policy orders_insert_scoped on public.orders
for insert to authenticated
with check (
  person_id=public.current_person_id()
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
);

create policy orders_update_scoped on public.orders
for update to authenticated
using (
  person_id=public.current_person_id()
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
)
with check (
  person_id=public.current_person_id()
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
);

create policy performance_select_scoped on public.performance_snapshots
for select to authenticated
using (
  person_id=public.current_person_id()
  or (public.current_role()='DISTRIBUTION' and role='BUSINESS_OWNER' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and (
       district_id=(public.current_membership()).district_id
       or (role='BUSINESS_OWNER' and distribution_id=(public.current_membership()).distribution_id)
  ))
  or (public.current_role()='LEADER' and (
       group_id=(public.current_membership()).group_id
       or (role='LEADER' and district_id=(public.current_membership()).district_id)
  ))
);

create policy achievements_select_scoped on public.achievements
for select to authenticated
using (
  person_id=public.current_person_id()
  or (public.current_role()='DISTRIBUTION' and distribution_id=(public.current_membership()).distribution_id and district_id is not null)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
  or (public.current_role()='LEADER' and group_id=(public.current_membership()).group_id)
);

create policy network_events_select_scoped on public.network_events
for select to authenticated
using (
  actor_person_id=public.current_person_id()
  or subject_person_id=public.current_person_id()
  or (visibility='DISTRIBUTION' and distribution_id=(public.current_membership()).distribution_id)
  or (visibility='DISTRICT' and district_id=(public.current_membership()).district_id)
  or (visibility='GROUP' and group_id=(public.current_membership()).group_id)
);

create policy network_events_insert_scoped on public.network_events
for insert to authenticated
with check (
  actor_person_id=public.current_person_id()
  and distribution_id=(public.current_membership()).distribution_id
  and (district_id is null or district_id=(public.current_membership()).district_id or public.current_role()='DISTRIBUTION')
  and (group_id is null or group_id=(public.current_membership()).group_id or public.current_role() in ('DISTRIBUTION','BUSINESS_OWNER'))
);

create policy audit_log_select_managers on public.audit_log
for select to authenticated
using (
  actor_person_id=public.current_person_id()
  or (public.current_role()='DISTRIBUTION' and distribution_id=(public.current_membership()).distribution_id)
  or (public.current_role()='BUSINESS_OWNER' and district_id=(public.current_membership()).district_id)
);

create policy audit_log_insert_actor on public.audit_log
for insert to authenticated
with check (
  actor_person_id=public.current_person_id()
  and (distribution_id is null or distribution_id=(public.current_membership()).distribution_id)
  and (district_id is null or district_id=(public.current_membership()).district_id or public.current_role()='DISTRIBUTION')
);
