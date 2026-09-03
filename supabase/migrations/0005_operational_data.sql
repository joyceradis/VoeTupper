-- VoeTupper operational data layer.
-- Canonical identity, network membership, raw imports and weekly facts stay separate by design.

alter type public.network_role add value if not exists 'RECRUIT';

alter table public.people add column if not exists source_member_id text;
alter table public.people add column if not exists legal_name text;
alter table public.people add column if not exists canonical_name text;
alter table public.people add column if not exists data_status text not null default 'pending_review';
alter table public.people drop constraint if exists people_data_status_check;
alter table public.people add constraint people_data_status_check
  check(data_status in ('confirmed','partial_name','pending_review','conflicting_identity'));
create unique index if not exists people_source_member_id_unique
  on public.people(source_member_id) where source_member_id is not null;

alter table public.memberships add column if not exists membership_status text not null default 'active';
alter table public.memberships add column if not exists source text;
alter table public.memberships add column if not exists updated_at timestamptz not null default now();
alter table public.memberships drop constraint if exists memberships_membership_status_check;
alter table public.memberships add constraint memberships_membership_status_check
  check(membership_status in ('active','inactive','historical','pending'));

alter table public.districts add column if not exists business_name text;
alter table public.districts add column if not exists display_name text;
alter table public.districts add column if not exists region_name text;
alter table public.districts add column if not exists status text not null default 'active';
alter table public.districts add column if not exists data_status text not null default 'confirmed';
alter table public.districts drop constraint if exists districts_status_check;
alter table public.districts add constraint districts_status_check check(status in ('pilot','active','inactive'));
alter table public.districts drop constraint if exists districts_data_status_check;
alter table public.districts add constraint districts_data_status_check check(data_status in ('confirmed','pending_review'));

alter table public.groups add column if not exists official_name text;
alter table public.groups add column if not exists display_name text;
alter table public.groups add column if not exists status text not null default 'active';
alter table public.groups add column if not exists data_status text not null default 'confirmed';
alter table public.groups drop constraint if exists groups_status_check;
alter table public.groups add constraint groups_status_check check(status in ('active','inactive','historical','pending'));
alter table public.groups drop constraint if exists groups_data_status_check;
alter table public.groups add constraint groups_data_status_check check(data_status in ('confirmed','pending_review'));

create table if not exists public.member_aliases(
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  name_variant text not null,
  normalized_variant text not null,
  source text,
  status text not null default 'pending' check(status in ('pending','confirmed','rejected','conflict')),
  confidence numeric(5,4) check(confidence is null or (confidence >= 0 and confidence <= 1)),
  match_method text,
  confirmed_by_person_id uuid references public.people(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(person_id,normalized_variant)
);

create table if not exists public.group_aliases(
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name_variant text not null,
  normalized_variant text not null,
  source text,
  status text not null default 'pending' check(status in ('pending','confirmed','rejected')),
  confirmed_by_person_id uuid references public.people(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(group_id,normalized_variant)
);

create table if not exists public.district_name_aliases(
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts(id) on delete cascade,
  name_variant text not null,
  source text,
  status text not null default 'pending_review' check(status in ('pending_review','confirmed','rejected')),
  created_at timestamptz not null default now(),
  unique(district_id,name_variant)
);

create table if not exists public.periods(
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  week integer not null check(week between 1 and 53),
  year integer not null check(year between 2020 and 2100),
  starts_at date,
  ends_at date,
  status text not null default 'closed' check(status in ('planned','active','closed')),
  created_at timestamptz not null default now(),
  unique(distribution_id,year,week)
);

create table if not exists public.import_batches(
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id) on delete restrict,
  district_id uuid references public.districts(id) on delete restrict,
  period_id uuid references public.periods(id) on delete restrict,
  source_file text,
  source_kind text not null default 'spreadsheet' check(source_kind in ('csv','spreadsheet','manual','report')),
  status text not null default 'preview' check(status in ('preview','pending_review','ready','committed','rejected')),
  responsible_person_id uuid references public.people(id) on delete set null,
  accepted_count integer not null default 0 check(accepted_count >= 0),
  rejected_count integer not null default 0 check(rejected_count >= 0),
  pending_count integer not null default 0 check(pending_count >= 0),
  expected_order_count integer,
  expected_item_quantity integer,
  expected_veteran_sales numeric(14,2),
  expected_recruit_sales numeric(14,2),
  expected_total_sales numeric(14,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  committed_at timestamptz
);

create table if not exists public.import_rows(
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references public.import_batches(id) on delete cascade,
  source_row_number integer,
  raw_name text,
  normalized_name text,
  raw_group_name text,
  mapped_person_id uuid references public.people(id) on delete set null,
  mapped_group_id uuid references public.groups(id) on delete set null,
  proposed_role public.network_role,
  data_status text not null default 'pending_review' check(data_status in ('confirmed','partial_name','pending_review','conflicting_identity')),
  row_status text not null default 'pending' check(row_status in ('accepted','rejected','pending')),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.import_issues(
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references public.import_batches(id) on delete cascade,
  import_row_id uuid references public.import_rows(id) on delete cascade,
  issue_type text not null check(issue_type in ('total_mismatch','duplicate_member','unknown_group','partial_name','identity_conflict','missing_period','invalid_value')),
  severity text not null default 'review' check(severity in ('warning','review','blocking')),
  message text not null,
  status text not null default 'open' check(status in ('open','resolved','accepted_exception')),
  resolved_by_person_id uuid references public.people(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_performance(
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid references public.import_batches(id) on delete set null,
  period_id uuid not null references public.periods(id) on delete cascade,
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid not null references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  aggregation_level text not null check(aggregation_level in ('district','group','member')),
  detail_status text not null default 'fully_detailed' check(detail_status in ('fully_detailed','partially_detailed','aggregate_only')),
  order_count integer check(order_count is null or order_count >= 0),
  item_quantity integer check(item_quantity is null or item_quantity >= 0),
  veteran_sales numeric(14,2) not null default 0 check(veteran_sales >= 0),
  recruit_sales numeric(14,2) not null default 0 check(recruit_sales >= 0),
  total_sales numeric(14,2) generated always as (veteran_sales + recruit_sales) stored,
  source_file text,
  import_status text not null default 'confirmed' check(import_status in ('confirmed','pending_review','rejected')),
  created_at timestamptz not null default now(),
  check(
    (aggregation_level='district' and group_id is null and person_id is null)
    or (aggregation_level='group' and group_id is not null and person_id is null)
    or (aggregation_level='member' and group_id is not null and person_id is not null)
  )
);
create index if not exists weekly_performance_scope_idx
  on public.weekly_performance(distribution_id,district_id,period_id,aggregation_level,group_id,person_id);

create table if not exists public.reconciliations(
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references public.import_batches(id) on delete cascade,
  period_id uuid not null references public.periods(id) on delete cascade,
  district_id uuid not null references public.districts(id) on delete cascade,
  expected_order_count integer,
  calculated_order_count integer,
  order_difference integer generated always as (coalesce(calculated_order_count,0)-coalesce(expected_order_count,0)) stored,
  expected_item_quantity integer,
  calculated_item_quantity integer,
  item_difference integer generated always as (coalesce(calculated_item_quantity,0)-coalesce(expected_item_quantity,0)) stored,
  expected_veteran_sales numeric(14,2),
  calculated_veteran_sales numeric(14,2),
  expected_recruit_sales numeric(14,2),
  calculated_recruit_sales numeric(14,2),
  expected_total_sales numeric(14,2),
  calculated_total_sales numeric(14,2),
  sales_difference numeric(14,2) generated always as (coalesce(calculated_total_sales,0)-coalesce(expected_total_sales,0)) stored,
  undetailed_order_count integer not null default 0,
  undetailed_item_quantity integer not null default 0,
  undetailed_veteran_sales numeric(14,2) not null default 0,
  undetailed_recruit_sales numeric(14,2) not null default 0,
  undetailed_total_sales numeric(14,2) generated always as (undetailed_veteran_sales + undetailed_recruit_sales) stored,
  status text not null default 'pending_review' check(status in ('reconciled','pending_review','divergent')),
  created_at timestamptz not null default now(),
  unique(import_batch_id,period_id,district_id)
);

create table if not exists public.recognitions(
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  distribution_id uuid not null references public.distributions(id) on delete cascade,
  district_id uuid references public.districts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  title text not null,
  position integer check(position is null or position > 0),
  period_label text,
  source text,
  status text not null default 'confirmed' check(status in ('confirmed','pending_review','historical')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Access to new operational tables follows the hierarchy already established in 0004.
alter table public.member_aliases enable row level security;
alter table public.group_aliases enable row level security;
alter table public.district_name_aliases enable row level security;
alter table public.periods enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_rows enable row level security;
alter table public.import_issues enable row level security;
alter table public.weekly_performance enable row level security;
alter table public.reconciliations enable row level security;
alter table public.recognitions enable row level security;

create policy member_aliases_scoped_read on public.member_aliases for select
using(public.can_view_person(person_id));
create policy member_aliases_admin_write on public.member_aliases for all
using(exists(
  select 1 from public.memberships target
  where target.person_id=member_aliases.person_id and target.ended_at is null
    and public.can_manage_scope(target.distribution_id,target.district_id,target.group_id)
))
with check(exists(
  select 1 from public.memberships target
  where target.person_id=member_aliases.person_id and target.ended_at is null
    and public.can_manage_scope(target.distribution_id,target.district_id,target.group_id)
));

create policy group_aliases_scoped_read on public.group_aliases for select
using(exists(
  select 1 from public.groups g where g.id=group_aliases.group_id
    and public.can_read_operational_scope(public.current_person_id(),g.distribution_id,g.district_id,g.id)
));
create policy group_aliases_admin_write on public.group_aliases for all
using(exists(select 1 from public.groups g where g.id=group_aliases.group_id and public.can_manage_scope(g.distribution_id,g.district_id,g.id)))
with check(exists(select 1 from public.groups g where g.id=group_aliases.group_id and public.can_manage_scope(g.distribution_id,g.district_id,g.id)));

create policy district_aliases_distribution_read on public.district_name_aliases for select
using(exists(
  select 1 from public.districts d
  join public.memberships viewer on viewer.person_id=public.current_person_id() and viewer.ended_at is null
  where d.id=district_name_aliases.district_id and viewer.distribution_id=d.distribution_id
));
create policy district_aliases_admin_write on public.district_name_aliases for all
using(exists(select 1 from public.districts d where d.id=district_name_aliases.district_id and public.can_manage_scope(d.distribution_id,d.id,null)))
with check(exists(select 1 from public.districts d where d.id=district_name_aliases.district_id and public.can_manage_scope(d.distribution_id,d.id,null)));

create policy periods_distribution_read on public.periods for select
using(exists(select 1 from public.memberships viewer where viewer.person_id=public.current_person_id() and viewer.ended_at is null and viewer.distribution_id=periods.distribution_id));

create policy import_batches_admin on public.import_batches for all
using(public.can_manage_scope(distribution_id,district_id,null))
with check(public.can_manage_scope(distribution_id,district_id,null));

create policy import_rows_admin on public.import_rows for all
using(exists(select 1 from public.import_batches b where b.id=import_rows.import_batch_id and public.can_manage_scope(b.distribution_id,b.district_id,null)))
with check(exists(select 1 from public.import_batches b where b.id=import_rows.import_batch_id and public.can_manage_scope(b.distribution_id,b.district_id,null)));

create policy import_issues_admin on public.import_issues for all
using(exists(select 1 from public.import_batches b where b.id=import_issues.import_batch_id and public.can_manage_scope(b.distribution_id,b.district_id,null)))
with check(exists(select 1 from public.import_batches b where b.id=import_issues.import_batch_id and public.can_manage_scope(b.distribution_id,b.district_id,null)));

create policy weekly_performance_scoped_read on public.weekly_performance for select
using(
  (person_id is not null and public.can_read_operational_scope(person_id,distribution_id,district_id,group_id))
  or (person_id is null and public.can_manage_scope(distribution_id,district_id,group_id))
  or exists(
    select 1 from public.memberships viewer
    where viewer.person_id=public.current_person_id() and viewer.ended_at is null
      and viewer.distribution_id=weekly_performance.distribution_id
      and viewer.district_id=weekly_performance.district_id
      and weekly_performance.aggregation_level='group'
      and viewer.group_id=weekly_performance.group_id
  )
);
create policy weekly_performance_admin_write on public.weekly_performance for all
using(public.can_manage_scope(distribution_id,district_id,group_id))
with check(public.can_manage_scope(distribution_id,district_id,group_id));

create policy reconciliations_admin on public.reconciliations for all
using(exists(select 1 from public.import_batches b where b.id=reconciliations.import_batch_id and public.can_manage_scope(b.distribution_id,b.district_id,null)))
with check(exists(select 1 from public.import_batches b where b.id=reconciliations.import_batch_id and public.can_manage_scope(b.distribution_id,b.district_id,null)));

create policy recognitions_scoped_read on public.recognitions for select
using(public.can_read_operational_scope(person_id,distribution_id,district_id,group_id));
create policy recognitions_admin_write on public.recognitions for all
using(public.can_manage_scope(distribution_id,district_id,group_id))
with check(public.can_manage_scope(distribution_id,district_id,group_id));
