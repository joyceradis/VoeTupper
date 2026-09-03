-- Preserve unknown values as unknown and add the temporary identity candidate requested for imports.

-- Temporary matching aid only. It is not a primary key and never authorizes an automatic merge.
-- Format/source rule: district + normalized name + group.
alter table public.import_rows
  add column if not exists identity_candidate_key text;

-- Unknown monetary components must remain NULL, never silently become zero.
alter table public.weekly_performance
  alter column veteran_sales drop not null,
  alter column veteran_sales drop default,
  alter column recruit_sales drop not null,
  alter column recruit_sales drop default;

-- A reconciliation difference is unknown whenever either side is unknown.
alter table public.reconciliations drop column if exists order_difference;
alter table public.reconciliations
  add column order_difference integer generated always as (calculated_order_count - expected_order_count) stored;

alter table public.reconciliations drop column if exists item_difference;
alter table public.reconciliations
  add column item_difference integer generated always as (calculated_item_quantity - expected_item_quantity) stored;

alter table public.reconciliations drop column if exists sales_difference;
alter table public.reconciliations
  add column sales_difference numeric(14,2) generated always as (calculated_total_sales - expected_total_sales) stored;

-- Undetailed amounts are nullable too: NULL means the source did not establish the value;
-- zero means the source explicitly established that there was none.
alter table public.reconciliations
  alter column undetailed_order_count drop not null,
  alter column undetailed_order_count drop default,
  alter column undetailed_item_quantity drop not null,
  alter column undetailed_item_quantity drop default,
  alter column undetailed_veteran_sales drop not null,
  alter column undetailed_veteran_sales drop default,
  alter column undetailed_recruit_sales drop not null,
  alter column undetailed_recruit_sales drop default;
