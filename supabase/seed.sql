insert into public.people(id,full_name,status) values
('fade6622-45dc-46fd-96e2-fa98d5c1dbf6','Gerusa','ACTIVE'),
('92c10876-3342-4aa8-b2be-1c1fc7992e8c','Giseli Aguilar','ACTIVE'),
('cfa8815b-d392-41e6-bacd-c1752279dc2b','Adriana Junta','ACTIVE'),
('45ae396c-2c09-4bde-b05b-b45d45a2024a','Ritheli Radis','ACTIVE'),
('fd940ed3-b713-4dc2-ba5e-0e2deed1b19a','Tatiana Madeira','ACTIVE'),
('aebef871-34ba-44eb-99b7-6b96cf0f6e91','Adriana Maia','ACTIVE'),
('77e2fca5-c09a-4cc5-adcf-0918b05caae0','Vanessa Luciana','ACTIVE')
on conflict(id) do update set full_name=excluded.full_name,status=excluded.status;

insert into public.distributions(id,country_code,state_code,name,responsible_person_id,status) values
('887c5cf6-bbb1-47a3-b73e-8fbb722dd115','BR','ES','Distribuição ES','fade6622-45dc-46fd-96e2-fa98d5c1dbf6','ACTIVE')
on conflict(country_code,state_code) do update set name=excluded.name,responsible_person_id=excluded.responsible_person_id,status=excluded.status;

insert into public.districts(id,distribution_id,name,region_label,business_owner_person_id,status) values
('dee851b5-ea14-4bbd-90f5-dc6409e73bd1','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','Norte','Norte do estado','92c10876-3342-4aa8-b2be-1c1fc7992e8c','ACTIVE'),
('493c53ab-1bc2-425f-8443-62fb80aab8c6','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','Noroeste','Região Noroeste','cfa8815b-d392-41e6-bacd-c1752279dc2b','ACTIVE'),
('6c3a4d34-f1f0-4936-b756-5292cacd141f','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','Serra','Região Serra','45ae396c-2c09-4bde-b05b-b45d45a2024a','ACTIVE'),
('3008397b-c767-44b1-81f9-85a71fb21c4b','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','Vitória','Região Vitória','fd940ed3-b713-4dc2-ba5e-0e2deed1b19a','ACTIVE'),
('ba0f1b6c-0e5f-4235-bccd-06334e54f8ba','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','Vila Velha e Sul','Vila Velha e sul do estado','aebef871-34ba-44eb-99b7-6b96cf0f6e91','ACTIVE'),
('aec6612b-6f74-4f13-88f9-882cb0ce934e','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','Cariacica','Distrito Cariacica','77e2fca5-c09a-4cc5-adcf-0918b05caae0','ACTIVE')
on conflict(distribution_id,name) do update set region_label=excluded.region_label,business_owner_person_id=excluded.business_owner_person_id,status=excluded.status;

insert into public.memberships(id,person_id,role,distribution_id,district_id,group_id,parent_person_id,valid_from,valid_to,is_current) values
('3722fe09-0be3-4ba7-829f-5c1934578d8d','fade6622-45dc-46fd-96e2-fa98d5c1dbf6','DISTRIBUTION','887c5cf6-bbb1-47a3-b73e-8fbb722dd115',null,null,null,'2026-09-03',null,true),
('e3f12ddd-23e0-4b36-8d43-3631918397c7','92c10876-3342-4aa8-b2be-1c1fc7992e8c','BUSINESS_OWNER','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','dee851b5-ea14-4bbd-90f5-dc6409e73bd1',null,'fade6622-45dc-46fd-96e2-fa98d5c1dbf6','2026-09-03',null,true),
('12d15760-71a9-498d-9333-9448d5b44179','cfa8815b-d392-41e6-bacd-c1752279dc2b','BUSINESS_OWNER','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','493c53ab-1bc2-425f-8443-62fb80aab8c6',null,'fade6622-45dc-46fd-96e2-fa98d5c1dbf6','2026-09-03',null,true),
('b87a25a5-8471-4f48-944a-0814e6794974','45ae396c-2c09-4bde-b05b-b45d45a2024a','BUSINESS_OWNER','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','6c3a4d34-f1f0-4936-b756-5292cacd141f',null,'fade6622-45dc-46fd-96e2-fa98d5c1dbf6','2026-09-03',null,true),
('a786c191-5856-457e-bd76-274065c6935c','fd940ed3-b713-4dc2-ba5e-0e2deed1b19a','BUSINESS_OWNER','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','3008397b-c767-44b1-81f9-85a71fb21c4b',null,'fade6622-45dc-46fd-96e2-fa98d5c1dbf6','2026-09-03',null,true),
('fc33731f-d89a-4044-b40b-54db6708bdd1','aebef871-34ba-44eb-99b7-6b96cf0f6e91','BUSINESS_OWNER','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','ba0f1b6c-0e5f-4235-bccd-06334e54f8ba',null,'fade6622-45dc-46fd-96e2-fa98d5c1dbf6','2026-09-03',null,true),
('3958e2bd-9319-415c-a3a0-d18236731cde','77e2fca5-c09a-4cc5-adcf-0918b05caae0','BUSINESS_OWNER','887c5cf6-bbb1-47a3-b73e-8fbb722dd115','aec6612b-6f74-4f13-88f9-882cb0ce934e',null,'fade6622-45dc-46fd-96e2-fa98d5c1dbf6','2026-09-03',null,true)
on conflict(id) do nothing;
