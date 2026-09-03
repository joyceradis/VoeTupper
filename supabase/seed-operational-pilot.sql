-- Operational pilot facts supplied for VoeTupper. No consultant PII is stored in this public seed.
-- "Distrito Plenitude" is retained as a pending-review display/alias for the current Serra district until canonical naming is confirmed.

update public.districts
set business_name='Vitoriaware',
    display_name='Distrito Plenitude',
    region_name='Serra',
    status='pilot',
    data_status='pending_review'
where id='10000000-0000-4000-8000-000000000013';

insert into public.district_name_aliases(id,district_id,name_variant,source,status)
values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Distrito Plenitude','operational requirement 2026-W36','pending_review')
on conflict (district_id,name_variant) do nothing;

insert into public.groups(id,distribution_id,district_id,name,official_name,display_name,status,data_status) values
('20000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Chama Viva','Chama Viva','Chama Viva','active','confirmed'),
('20000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Charme','Charme','Charme','active','confirmed'),
('20000000-0000-4000-8000-000000000103','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Chefas','Chefas','Chefas','active','confirmed'),
('20000000-0000-4000-8000-000000000104','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Equipe Excelência',null,'Equipe Excelência','active','pending_review'),
('20000000-0000-4000-8000-000000000105','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Esperança','Esperança','Esperança','active','confirmed'),
('20000000-0000-4000-8000-000000000106','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Estrela do Sucesso',null,'Estrela do Sucesso','active','pending_review'),
('20000000-0000-4000-8000-000000000107','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Fenomenal','Fenomenal','Fenomenal','active','confirmed'),
('20000000-0000-4000-8000-000000000108','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Fidelidade','Fidelidade','Fidelidade','active','confirmed'),
('20000000-0000-4000-8000-000000000109','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Force Active',null,'Force Active','active','pending_review'),
('20000000-0000-4000-8000-000000000110','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Grandes Conquistas',null,'Grandes Conquistas','active','pending_review'),
('20000000-0000-4000-8000-000000000111','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Joia Rara','Joia Rara','Joia Rara','active','confirmed'),
('20000000-0000-4000-8000-000000000112','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Mania de Vencer','Mania de Vencer','Mania de Vencer','active','confirmed'),
('20000000-0000-4000-8000-000000000113','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Mima','Mima','Mima','active','confirmed'),
('20000000-0000-4000-8000-000000000114','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Tropical','Tropical','Tropical','active','confirmed'),
('20000000-0000-4000-8000-000000000115','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Tupper Amigas','Tupper Amigas','Tupper Amigas','active','confirmed'),
('20000000-0000-4000-8000-000000000116','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013','Yeshua','Yeshua','Yeshua','active','confirmed')
on conflict (district_id,name) do update set
  official_name=excluded.official_name,
  display_name=excluded.display_name,
  status=excluded.status,
  data_status=excluded.data_status;

insert into public.group_aliases(id,group_id,name_variant,normalized_variant,source,status)
values('20000000-0000-4000-8000-000000000201','20000000-0000-4000-8000-000000000109','Força Ativa','forca ativa','operational requirement 2026-W36','pending')
on conflict (group_id,normalized_variant) do nothing;

insert into public.periods(id,distribution_id,week,year,status) values
('20000000-0000-4000-8000-000000000232','10000000-0000-4000-8000-000000000001',32,2026,'closed'),
('20000000-0000-4000-8000-000000000233','10000000-0000-4000-8000-000000000001',33,2026,'closed'),
('20000000-0000-4000-8000-000000000234','10000000-0000-4000-8000-000000000001',34,2026,'closed'),
('20000000-0000-4000-8000-000000000235','10000000-0000-4000-8000-000000000001',35,2026,'closed'),
('20000000-0000-4000-8000-000000000236','10000000-0000-4000-8000-000000000001',36,2026,'closed')
on conflict (distribution_id,year,week) do nothing;

insert into public.import_batches(
  id,distribution_id,district_id,period_id,source_file,source_kind,status,responsible_person_id,
  accepted_count,rejected_count,pending_count,expected_order_count,expected_item_quantity,
  expected_veteran_sales,expected_recruit_sales,expected_total_sales,metadata
) values (
  '20000000-0000-4000-8000-000000000301',
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000013',
  '20000000-0000-4000-8000-000000000236',
  null,'report','pending_review','10000000-0000-4000-8000-000000000104',
  26,0,16,47,516,32557.70,802.20,33359.90,
  jsonb_build_object(
    'individual_lines_received',39,
    'aggregate_groups_received',3,
    'detailed_items',440,
    'detailed_sales',27787.40,
    'complete_names_visible',23,
    'partial_or_uncertain_names',16,
    'groups_without_individual_detail',jsonb_build_array('Estrela do Sucesso','Fenomenal','Fidelidade'),
    'overall_report_totals',jsonb_build_object('orders',1446,'items',19906,'veteran_sales',1039135.80,'recruit_sales',80180.30,'total_sales',1119316.10),
    'overall_totals_scope_note','Includes periods/pages not supplied and must not be attributed only to weeks 32-36',
    'raw_name_policy','partial_name values remain unresolved until administrative confirmation'
  )
)
on conflict (id) do nothing;

insert into public.weekly_performance(
  id,import_batch_id,period_id,distribution_id,district_id,group_id,person_id,aggregation_level,detail_status,
  order_count,item_quantity,veteran_sales,recruit_sales,source_file,import_status
) values
('20000000-0000-4000-8000-000000000332',null,'20000000-0000-4000-8000-000000000232','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013',null,null,'district','aggregate_only',131,1840,102810.40,2479.50,null,'confirmed'),
('20000000-0000-4000-8000-000000000333',null,'20000000-0000-4000-8000-000000000233','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013',null,null,'district','aggregate_only',50,766,36763.60,2001.30,null,'confirmed'),
('20000000-0000-4000-8000-000000000334',null,'20000000-0000-4000-8000-000000000234','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013',null,null,'district','aggregate_only',70,1099,50397.40,3258.20,null,'confirmed'),
('20000000-0000-4000-8000-000000000335',null,'20000000-0000-4000-8000-000000000235','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013',null,null,'district','aggregate_only',100,1332,71577.80,3687.30,null,'confirmed'),
('20000000-0000-4000-8000-000000000336','20000000-0000-4000-8000-000000000301','20000000-0000-4000-8000-000000000236','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000013',null,null,'district','partially_detailed',47,516,32557.70,802.20,null,'confirmed')
on conflict (id) do nothing;

insert into public.reconciliations(
  id,import_batch_id,period_id,district_id,
  expected_order_count,calculated_order_count,expected_item_quantity,calculated_item_quantity,
  expected_veteran_sales,calculated_veteran_sales,expected_recruit_sales,calculated_recruit_sales,
  expected_total_sales,calculated_total_sales,
  undetailed_order_count,undetailed_item_quantity,undetailed_veteran_sales,undetailed_recruit_sales,status
) values (
  '20000000-0000-4000-8000-000000000401','20000000-0000-4000-8000-000000000301','20000000-0000-4000-8000-000000000236','10000000-0000-4000-8000-000000000013',
  47,47,516,516,32557.70,32557.70,802.20,802.20,33359.90,33359.90,
  8,76,4770.30,802.20,'reconciled'
)
on conflict (import_batch_id,period_id,district_id) do nothing;

-- Reference subtotal for the visible weeks 32-36, stored as metadata rather than a fake performance period.
update public.import_batches
set metadata = metadata || jsonb_build_object(
  'visible_weeks_subtotal',jsonb_build_object(
    'orders',398,'items',5553,'veteran_sales',294106.90,'recruit_sales',12228.50,'total_sales',306335.40
  ),
  'undetailed_total_sales',5572.50,
  'data_status_example','partial_name'
)
where id='20000000-0000-4000-8000-000000000301';