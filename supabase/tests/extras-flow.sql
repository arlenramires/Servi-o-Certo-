begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('60000000-0000-4000-8000-000000000001','{"full_name":"TEST EXTRAS CLIENT"}',now()),
 ('60000000-0000-4000-8000-000000000002','{"full_name":"TEST EXTRAS PROVIDER"}',now()),
 ('60000000-0000-4000-8000-000000000003','{"full_name":"TEST EXTRAS OUTSIDER"}',now());
update public.profiles set role='prestador' where id='60000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status) values
 ('61000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000002','Pintor','TEST serviço com escopo adicional','em_andamento'),
 ('61000000-0000-4000-8000-000000000002','60000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000002','Pintor','TEST serviço ainda não iniciado','aceito');

set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
select set_config('test.extra1',public.propose_service_extra('61000000-0000-4000-8000-000000000001',2550,'TEST Pintura adicional da parede externa')::text,true);
do $$begin
 if not exists(select 1 from public.service_extras where id=current_setting('test.extra1')::uuid and amount_cents=2550 and status='proposto' and description='TEST Pintura adicional da parede externa') then raise exception 'Extra snapshot missing';end if;
 begin perform public.propose_service_extra('61000000-0000-4000-8000-000000000001',1000,'TEST Segundo extra ainda pendente');raise exception 'Second pending extra allowed';exception when sqlstate 'EX003' then null;end;
 begin perform public.propose_service_extra('61000000-0000-4000-8000-000000000002',1000,'TEST Extra antes do início');raise exception 'Pre-start extra allowed';exception when sqlstate 'EX002' then null;end;
 begin insert into public.service_extras(request_id,provider_id,description,amount_cents) values('61000000-0000-4000-8000-000000000001',auth.uid(),'TEST direct insert',100);raise exception 'Direct extra insert allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
select public.decide_service_extra(current_setting('test.extra1')::uuid,'aceito');
select public.decide_service_extra(current_setting('test.extra1')::uuid,'aceito');
do $$begin
 if not exists(select 1 from public.service_extras where id=current_setting('test.extra1')::uuid and status='aceito' and decided_by=auth.uid() and decided_at is not null) then raise exception 'Accepted extra decision missing';end if;
 begin perform public.decide_service_extra(current_setting('test.extra1')::uuid,'recusado');raise exception 'Extra decision changed';exception when sqlstate 'EX003' then null;end;
 begin perform public.decide_service_extra(current_setting('test.extra1')::uuid,null);raise exception 'Null decision allowed';exception when sqlstate 'EX001' then null;end;
 begin perform public.propose_service_extra('61000000-0000-4000-8000-000000000001',1000,'TEST cliente tentou propor extra');raise exception 'Client proposed extra';exception when insufficient_privilege then null;end;
 begin update public.service_extras set status='recusado';raise exception 'Direct extra update allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
select set_config('test.extra2',public.propose_service_extra('61000000-0000-4000-8000-000000000001',3000,'TEST Troca adicional de acabamento')::text,true);
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
select public.decide_service_extra(current_setting('test.extra2')::uuid,'recusado');
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
select set_config('test.extra3',public.propose_service_extra('61000000-0000-4000-8000-000000000001',1500,'TEST Proteção adicional do piso')::text,true);
do $$begin
 begin perform public.request_service_completion('61000000-0000-4000-8000-000000000001');raise exception 'Completion allowed with pending extra';exception when sqlstate 'EX004' then null;end;
end $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
select public.decide_service_extra(current_setting('test.extra3')::uuid,'recusado');
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
select public.request_service_completion('61000000-0000-4000-8000-000000000001');
do $$begin
 if (select count(*) from public.service_extras where request_id='61000000-0000-4000-8000-000000000001')<>3 then raise exception 'Extra history incomplete';end if;
 if (select count(*) from public.service_execution_events where request_id='61000000-0000-4000-8000-000000000001' and event_type='conclusao_solicitada')<>1 then raise exception 'Completion not recorded after decisions';end if;
end $$;

select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_extras) then raise exception 'Outsider read extras';end if;
 begin perform public.decide_service_extra(current_setting('test.extra1')::uuid,'aceito');raise exception 'Outsider decided extra';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'extras-flow: passed' as result;
