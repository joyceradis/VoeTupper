-- Administrative writes are stricter than ordinary group operations.
-- Leaders can operate their group, but cannot change identity, membership, imports or reconciliations.

create or replace function public.can_admin_scope(target_distribution_id uuid, target_district_id uuid)
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
      )
  )
$$;

-- Structural network membership is administrative.
drop policy if exists memberships_scoped_write on public.memberships;
create policy memberships_admin_write on public.memberships for all
using(public.can_admin_scope(distribution_id,district_id))
with check(public.can_admin_scope(distribution_id,district_id));

-- Identity resolution is administrative.
drop policy if exists member_aliases_admin_write on public.member_aliases;
create policy member_aliases_admin_write on public.member_aliases for all
using(exists(
  select 1 from public.memberships target
  where target.person_id=member_aliases.person_id
    and target.ended_at is null
    and public.can_admin_scope(target.distribution_id,target.district_id)
))
with check(exists(
  select 1 from public.memberships target
  where target.person_id=member_aliases.person_id
    and target.ended_at is null
    and public.can_admin_scope(target.distribution_id,target.district_id)
));

-- Alias visibility follows the hierarchy without abusing the self-read shortcut.
drop policy if exists group_aliases_scoped_read on public.group_aliases;
create policy group_aliases_scoped_read on public.group_aliases for select
using(exists(
  select 1
  from public.groups g
  join public.memberships viewer
    on viewer.person_id=public.current_person_id()
   and viewer.ended_at is null
  where g.id=group_aliases.group_id
    and viewer.distribution_id=g.distribution_id
    and (
      viewer.role='DISTRIBUTION'
      or (viewer.role='BUSINESS_OWNER' and viewer.district_id=g.district_id)
      or (viewer.role in ('LEADER','CONSULTANT','RECRUIT') and viewer.group_id=g.id)
    )
));

drop policy if exists group_aliases_admin_write on public.group_aliases;
create policy group_aliases_admin_write on public.group_aliases for all
using(exists(select 1 from public.groups g where g.id=group_aliases.group_id and public.can_admin_scope(g.distribution_id,g.district_id)))
with check(exists(select 1 from public.groups g where g.id=group_aliases.group_id and public.can_admin_scope(g.distribution_id,g.district_id)));

drop policy if exists district_aliases_admin_write on public.district_name_aliases;
create policy district_aliases_admin_write on public.district_name_aliases for all
using(exists(select 1 from public.districts d where d.id=district_name_aliases.district_id and public.can_admin_scope(d.distribution_id,d.id)))
with check(exists(select 1 from public.districts d where d.id=district_name_aliases.district_id and public.can_admin_scope(d.distribution_id,d.id)));

-- Import pipeline and reconciled facts are restricted to distribution/business-owner administrators.
drop policy if exists import_batches_admin on public.import_batches;
create policy import_batches_admin on public.import_batches for all
using(public.can_admin_scope(distribution_id,district_id))
with check(public.can_admin_scope(distribution_id,district_id));

drop policy if exists import_rows_admin on public.import_rows;
create policy import_rows_admin on public.import_rows for all
using(exists(select 1 from public.import_batches b where b.id=import_rows.import_batch_id and public.can_admin_scope(b.distribution_id,b.district_id)))
with check(exists(select 1 from public.import_batches b where b.id=import_rows.import_batch_id and public.can_admin_scope(b.distribution_id,b.district_id)));

drop policy if exists import_issues_admin on public.import_issues;
create policy import_issues_admin on public.import_issues for all
using(exists(select 1 from public.import_batches b where b.id=import_issues.import_batch_id and public.can_admin_scope(b.distribution_id,b.district_id)))
with check(exists(select 1 from public.import_batches b where b.id=import_issues.import_batch_id and public.can_admin_scope(b.distribution_id,b.district_id)));

drop policy if exists weekly_performance_admin_write on public.weekly_performance;
create policy weekly_performance_admin_write on public.weekly_performance for all
using(public.can_admin_scope(distribution_id,district_id))
with check(public.can_admin_scope(distribution_id,district_id));

drop policy if exists reconciliations_admin on public.reconciliations;
create policy reconciliations_admin on public.reconciliations for all
using(exists(select 1 from public.import_batches b where b.id=reconciliations.import_batch_id and public.can_admin_scope(b.distribution_id,b.district_id)))
with check(exists(select 1 from public.import_batches b where b.id=reconciliations.import_batch_id and public.can_admin_scope(b.distribution_id,b.district_id)));

drop policy if exists recognitions_admin_write on public.recognitions;
create policy recognitions_admin_write on public.recognitions for all
using(public.can_admin_scope(distribution_id,district_id))
with check(public.can_admin_scope(distribution_id,district_id));
