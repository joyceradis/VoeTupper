-- VoeTupper operational data integrity hardening.
-- Unknown values remain NULL. Temporary identity matching never becomes a canonical person key.

-- Staging identity candidate only: district + normalized name + group.
-- The backend may populate this after the group is mapped. It is never a primary key
-- and never authorizes an automatic merge of two people.
alter table public.import_rows
  add column if not exists identity_candidate_key text;

comment on column public.import_rows.identity_candidate_key is
  'Temporary candidate key: district + normalized name + group. Administrative confirmation is required before linking identities.';

create index if not exists import_rows_identity_candidate_idx
  on public.import_rows(import_batch_id, identity_candidate_key)
  where identity_candidate_key is not null;

create or replace function public.build_identity_candidate_key(
  target_district_id uuid,
  target_normalized_name text,
  target_group_id uuid
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when target_district_id is null or nullif(trim(target_normalized_name),'') is null or target_group_id is null then null
    else target_district_id::text || '|' || lower(trim(target_normalized_name)) || '|' || target_group_id::text
  end
$$;

-- Missing sales are not zero. A zero must be supplied explicitly by the source.
alter table public.weekly_performance
  alter column veteran_sales drop not null,
  alter column veteran_sales drop default,
  alter column recruit_sales drop not null,
  alter column recruit_sales drop default;

alter table public.weekly_performance
  drop constraint if exists weekly_performance_veteran_sales_check,
  drop constraint if exists weekly_performance_recruit_sales_check;

alter table public.weekly_performance
  add constraint weekly_performance_veteran_sales_check
    check(veteran_sales is null or veteran_sales >= 0),
  add constraint weekly_performance_recruit_sales_check
    check(recruit_sales is null or recruit_sales >= 0);

-- A reconciliation difference is unknown whenever either side is unknown.
-- COALESCE(..., 0) would fabricate a value and is deliberately removed.
alter table public.reconciliations
  drop column if exists order_difference,
  drop column if exists item_difference,
  drop column if exists sales_difference;

alter table public.reconciliations
  add column order_difference integer
    generated always as (calculated_order_count - expected_order_count) stored,
  add column item_difference integer
    generated always as (calculated_item_quantity - expected_item_quantity) stored,
  add column sales_difference numeric(14,2)
    generated always as (calculated_total_sales - expected_total_sales) stored;

-- Undetailed amounts may also be unknown. Known zero is still represented by an explicit 0.
alter table public.reconciliations
  alter column undetailed_order_count drop not null,
  alter column undetailed_order_count drop default,
  alter column undetailed_item_quantity drop not null,
  alter column undetailed_item_quantity drop default,
  alter column undetailed_veteran_sales drop not null,
  alter column undetailed_veteran_sales drop default,
  alter column undetailed_recruit_sales drop not null,
  alter column undetailed_recruit_sales drop default;

alter table public.reconciliations
  add constraint reconciliations_undetailed_order_count_check
    check(undetailed_order_count is null or undetailed_order_count >= 0),
  add constraint reconciliations_undetailed_item_quantity_check
    check(undetailed_item_quantity is null or undetailed_item_quantity >= 0),
  add constraint reconciliations_undetailed_veteran_sales_check
    check(undetailed_veteran_sales is null or undetailed_veteran_sales >= 0),
  add constraint reconciliations_undetailed_recruit_sales_check
    check(undetailed_recruit_sales is null or undetailed_recruit_sales >= 0);
