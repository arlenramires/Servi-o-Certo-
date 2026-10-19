begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('80000000-0000-4000-8000-000000000001','{"full_name":"TEST INSPECTION CLIENT"}',now()),
 ('80000000-0000-4000-8000-000000000002','{"full_name":"TEST INSPECTION PROVIDER"}',now()),
 ('80000000-0000-4000-8000-000000000003','{"full_name":"TEST INSPECTION OUTSIDER"}',now());
update public.profiles set role='prestador' where id='80000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status) values
 ('81000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000002','Engenheiro civil','TEST pedido que exige vistoria','aceito'),
 ('81000000-0000-4000-8000-000000000002','80000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000002','Pintor','TEST pedido com orçamento existente','aceito');

set local role authenticated;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000002',true);
select set_config('test.inspection_time',(now()+interval '2 days')::text,true);
select set_config('test.inspection',public.propose_service_inspection('81000000-0000-4000-8000-000000000001',7500,current_setting('test.inspection_time')::timestamptz,'TEST avaliar estrutura antes de elaborar o orçamento')::text,true);
select public.propose_service_inspection('81000000-0000-4000-8000-000000000001',7500,current_setting('test.inspection_time')::timestamptz,'TEST avaliar estrutura antes de elaborar o orçamento');
insert into public.service_quotes(request_id,provider_id,amount_cents,description) values('81000000-0000-4000-8000-000000000002',auth.uid(),10000,'TEST orçamento existente');
do $$begin
 if not exists(select 1 from public.service_inspections where id=current_setting('test.inspection')::uuid and fee_cents=7500 and status='proposta' and provider_id=auth.uid()) then raise exception 'Inspection snapshot missing';end if;
 begin perform public.propose_service_inspection('81000000-0000-4000-8000-000000000001',8000,now()+interval '3 days','TEST tentativa de alterar proposta já registrada');raise exception 'Inspection changed';exception when sqlstate 'VI003' then null;end;
 begin perform public.propose_service_inspection('81000000-0000-4000-8000-000000000002',5000,now()+interval '2 days','TEST vistoria depois de orçamento já registrado');raise exception 'Inspection after quote allowed';exception when sqlstate 'VI002' then null;end;
 begin perform public.propose_service_inspection('81000000-0000-4000-8000-000000000001',5000,now()-interval '1 day','TEST data de vistoria inválida no passado');raise exception 'Past inspection allowed';exception when sqlstate 'VI001' then null;end;
 begin perform public.decide_service_inspection(current_setting('test.inspection')::uuid,'recusada');raise exception 'Provider decided inspection';exception when insufficient_privilege then null;end;
 begin insert into public.service_inspections(request_id,provider_id,purpose,scheduled_for,fee_cents) values('81000000-0000-4000-8000-000000000002',auth.uid(),'TEST escrita direta de vistoria',now()+interval '1 day',100);raise exception 'Direct inspection insert allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000001',true);
select public.decide_service_inspection(current_setting('test.inspection')::uuid,'aceita_pendente_pagamento');
select public.decide_service_inspection(current_setting('test.inspection')::uuid,'aceita_pendente_pagamento');
do $$begin
 if not exists(select 1 from public.service_inspections where id=current_setting('test.inspection')::uuid and status='aceita_pendente_pagamento' and decided_by=auth.uid() and decided_at is not null) then raise exception 'Inspection decision missing';end if;
 begin perform public.decide_service_inspection(current_setting('test.inspection')::uuid,'recusada');raise exception 'Inspection decision changed';exception when sqlstate 'VI003' then null;end;
 begin perform public.propose_service_inspection('81000000-0000-4000-8000-000000000002',5000,now()+interval '2 days','TEST cliente tentou propor uma vistoria prévia');raise exception 'Client proposed inspection';exception when insufficient_privilege then null;end;
 begin update public.service_inspections set status='recusada';raise exception 'Direct inspection update allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_inspections) then raise exception 'Outsider read inspections';end if;
 begin perform public.decide_service_inspection(current_setting('test.inspection')::uuid,'recusada');raise exception 'Outsider decided inspection';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'inspection-flow: passed' as result;
